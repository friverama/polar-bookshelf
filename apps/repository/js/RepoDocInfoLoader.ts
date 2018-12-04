import {DocMetaRef} from '../../../web/js/datastore/DocMetaRef';
import {Optional} from '../../../web/js/util/ts/Optional';
import {IListenablePersistenceLayer} from '../../../web/js/datastore/IListenablePersistenceLayer';
import {Logger} from '../../../web/js/logger/Logger';
import {Progress} from '../../../web/js/util/Progress';
import {ProgressBar} from '../../../web/js/ui/progress_bar/ProgressBar';
import {RepoDocInfoIndex} from './RepoDocInfoIndex';
import {RepoDocInfos} from './RepoDocInfos';
import {Dictionaries} from '../../../web/js/util/Dictionaries';
import {RepoDocInfo} from './RepoDocInfo';
import {DocMeta} from '../../../web/js/metadata/DocMeta';
import {DocMetaSnapshotEvent, SnapshotUnsubscriber} from '../../../web/js/datastore/Datastore';
import {ElectronContextTypes} from '../../../web/js/electron/context/ElectronContextTypes';
import {Promises} from '../../../web/js/util/Promises';
import {PersistenceLayerManager} from '../../../web/js/datastore/PersistenceLayerManager';
import {PersistenceLayerManagerEvent} from '../../../web/js/datastore/PersistenceLayerManager';
import {NULL_FUNCTION} from '../../../web/js/util/Functions';
import {PersistenceLayer} from '../../../web/js/datastore/PersistenceLayer';
import {IEventDispatcher, SimpleReactor} from '../../../web/js/reactor/SimpleReactor';

const log = Logger.create();

export class RepoDocInfoLoader {

    private readonly persistenceLayerManager: PersistenceLayerManager;

    private snapshotUnsubscriber: SnapshotUnsubscriber = NULL_FUNCTION;

    private readonly eventDispatcher: IEventDispatcher<RepoDocInfoIndex> = new SimpleReactor();

    constructor(persistenceLayerManager: PersistenceLayerManager) {
        this.persistenceLayerManager = persistenceLayerManager;
    }

    public addEventListener(listener: (repoDocInfoIndex: RepoDocInfoIndex) => void): void {
        this.eventDispatcher.addEventListener(listener);
    }


    public async start() {

        // TODO: there's latency here as we shouldn't have to load the ENTIRE
        // doc repo to update the UI...  We should update it as it's parsed via
        // events.

        // FIXME: add this when the persistence layer changes...

        this.persistenceLayerManager.addEventListener(event => {

            console.log("FIXME: got event: " + event);

            if (event.state === 'stopped') {
                log.info("Unsubscribing previous snapshot listener.");
                this.snapshotUnsubscriber();
            }

            if (event.state === 'initialized') {
                this.onPersistenceLayerInitialized(event.persistenceLayer);
            }

        });

    }

    private onPersistenceLayerInitialized(persistenceLayer: PersistenceLayer) {

        // FIXME: the disk datastore doesn't do its own snapshot by
        // default so we wouldn't get events by default... and the
        // cloud datastore DOES do it by default... maybe we have a
        // snapshotOnInit method to always require this behavior...

        this.snapshotUnsubscriber();

        persistenceLayer.snapshot(async (docMetaSnapshotEvent: DocMetaSnapshotEvent) => {

            const repoDocInfoIndex: RepoDocInfoIndex = {};

            const progressBar = ProgressBar.create(false);

            const {progress, docMetaMutations} = docMetaSnapshotEvent;

            for (const docMetaMutation of docMetaMutations) {

                const docMeta = await docMetaMutation.docMetaProvider();
                const docInfo = docMeta.docInfo;

                const repoDocInfo = await this.loadDocMeta(docInfo.fingerprint, docMeta);

                if (repoDocInfo && RepoDocInfos.isValid(repoDocInfo)) {
                    repoDocInfoIndex[repoDocInfo.fingerprint] = repoDocInfo;
                }

                progressBar.update(progress.progress);

            }

            this.eventDispatcher.dispatchEvent(repoDocInfoIndex);

            progressBar.destroy();

        }).then(snapshotResult => {

            this.snapshotUnsubscriber = snapshotResult.unsubscribe || NULL_FUNCTION;

        }).catch(err => log.error("Could not handle snapshot: ", err));

    }

    private async loadDocMetaFile(docMetaRef: DocMetaRef): Promise<RepoDocInfo | undefined> {

        if (! this.persistenceLayerManager) {
            throw new Error("No persistence layer");
        }

        let docMeta: DocMeta | undefined;

        try {

            const persistenceLayer = this.persistenceLayerManager.get();

            docMeta = await persistenceLayer.getDocMeta(docMetaRef.fingerprint);

            return this.loadDocMeta(docMetaRef.fingerprint, docMeta);

        } catch (e) {
            log.error("Unable to load DocMeta for " + docMetaRef.fingerprint, e);

            return undefined;
        }

    }

    private async loadDocMeta(fingerprint: string, docMeta?: DocMeta): Promise<RepoDocInfo | undefined> {

        if (docMeta !== undefined) {

            if (docMeta.docInfo) {

                return RepoDocInfos.convertFromDocInfo(docMeta.docInfo);

            } else {
                log.warn("No docInfo for file: ", fingerprint);
            }

        } else {
            log.warn("No DocMeta for fingerprint: " + fingerprint);
        }

        return undefined;

    }



    /**
     * Some of our documents might be broken and we should filter them to not
     * break the UI.
     *
     * @param repoDocInfoIndex
     */
    private async filterInvalid(repoDocInfoIndex: RepoDocInfoIndex) {

        const filtered = Object.values(repoDocInfoIndex)
            .filter(current => RepoDocInfos.isValid(current));

        return Dictionaries.toDict(filtered, (value) => value.fingerprint);

    }

}
