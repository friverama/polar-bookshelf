import * as React from 'react';
import {Logger} from '../logger/Logger';
import {DocAnnotation} from './DocAnnotation';
import {RichTextEditor4} from '../apps/card_creator/elements/schemaform/RichTextEditor4';
import Button from 'reactstrap/lib/Button';
import {RichTextArea} from './RichTextArea';
import Select from 'react-select';
import {FlashcardType} from '../metadata/FlashcardType';

const log = Logger.create();

export class AnnotationFlashcardBox extends React.Component<IProps, IState> {

    private front: htmlstring = "";
    private back: htmlstring = "";

    constructor(props: IProps, context: any) {
        super(props, context);

        this.onCreate = this.onCreate.bind(this);
        this.onCancel = this.onCancel.bind(this);

        this.state = {
            iter: 0
        };

    }

    public render() {

        const { id } = this.props;

        return (

            <div id="annotation-flashcard-box" className="">

                <RichTextArea label="front"
                              id={`front-${id}`}
                              autofocus={true}
                              onKeyDown={event => this.onKeyDown(event)}
                              onChange={(html) => this.front = html}/>

                <RichTextArea label="back"
                              id={`back-${id}`}
                              onChange={(html) => this.back = html}/>

                <div className="text-right">

                    <Button color="secondary" size="sm" className="mt-2" onClick={() => this.onCancel()}>
                        Cancel
                    </Button>

                    <Button color="primary" size="sm" className="mt-2 ml-1" onClick={() => this.onCreate()}>
                        Create
                    </Button>

                </div>

            </div>

        );

    }

    private onKeyDown(event: KeyboardEvent) {

        // if (event.key === "Escape") {
        //     this.toggle();
        // }

        if (event.getModifierState("Control") && event.key === "Enter") {
            this.onCreate();
        }

    }

    private onCreate(): void {

        if (this.props.onFlashcardCreated) {

            const fields: FrontAndBackFields = {
                front: this.front,
                back: this.back
            };

            this.props.onFlashcardCreated(this.props.type, fields);

        }

        this.setState({
            iter: this.state.iter + 1
        });

    }

    private onCancel(): void {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

}

export interface IProps {
    readonly id: string;
    readonly type: FlashcardType;
    readonly onFlashcardCreated?: (type: FlashcardType, fields: FrontAndBackFields | ClozeFields) => void;
    readonly onCancel?: () => void;
}

export interface IState {
    readonly iter: number;
}

export type htmlstring = string;

export interface ClozeFields {
    readonly text: htmlstring;
}

export interface FrontAndBackFields {
    readonly front: htmlstring;
    readonly back: htmlstring;
}
