import {ipcRenderer} from 'electron';
import {SchemaFormFlashcardConverter} from './SchemaFormFlashcardConverter';
import {FormHandler} from '../elements/schemaform/FormHandler';
import {CreateFlashcardRequest} from '../CreateFlashcardRequest';
import {AnnotationContainer} from '../../../metadata/AnnotationContainer';
import {AnnotationDescriptor} from '../../../metadata/AnnotationDescriptor';
import {SchemaFormData} from '../elements/schemaform/SchemaFormData';
import {Logger} from '../../../logger/Logger';
import {AnnotationType} from '../../../metadata/AnnotationType';

const log = Logger.create();

export class PostMessageFormHandler extends FormHandler {

    private readonly createFlashcardRequest: CreateFlashcardRequest;

    constructor(createFlashcardRequest: CreateFlashcardRequest) {
        super();
        this.createFlashcardRequest = createFlashcardRequest;
    }

    onChange(data: any) {
        log.info("onChange: ", data);
    }

    /**
     *
     * @param schemaFormData
     */
    onSubmit(schemaFormData: SchemaFormData) {

        log.info("onSubmit: ", schemaFormData);

        let archetype = "9d146db1-7c31-4bcf-866b-7b485c4e50ea";

        let flashcard = SchemaFormFlashcardConverter.convert(schemaFormData, archetype);

        let annotationDescriptor
            = AnnotationDescriptor.newInstance(AnnotationType.FLASHCARD,
                                               flashcard.id,
                                               this.createFlashcardRequest.docDescriptor.fingerprint,
                                               this.createFlashcardRequest.pageNum);

        let annotationContainer = AnnotationContainer.newInstance(annotationDescriptor, flashcard);

        //
        // let createAnnotationRequest
        //     = new CreateAnnotationRequest(this.createFlashcardRequest.docDescriptor,
        //                                   AnnotationType.FLASHCARD,
        //                                   schemaFormData);

        // // FIXME: ok.. we can't just use a generic
        //
        // // FIXME: this is broken..
        // // the metadata for creating the flashcard type.  This should probably
        // // move to the schema in the future.  The ID is really just so that
        // // we can compile the schema properly.
        // schemaFormData.flashcard = {
        //     id: "9d146db1-7c31-4bcf-866b-7b485c4e50ea"
        // };

        // send this to the main process which then broadcasts it to all the
        // renderers

        // FIXME: use an IPC client here...
        ipcRenderer.send('create-annotation', annotationContainer);

    }

    onError(data: any) {
        log.info("onError: ", data);
        //window.postMessage({ type: "onError", data: dataToExternal(data)},
        // "*");
    }

}
