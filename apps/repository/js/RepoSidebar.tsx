import * as React from 'react';
import {Button, ListGroup} from 'reactstrap';
import {Logger} from '../../../web/js/logger/Logger';
import {IStyleMap} from '../../../web/js/react/IStyleMap';
import {Blackout} from './Blackout';
import {NavLogo} from './nav/NavLog';
import {RepoSidebarItem} from './sidebar/RepoSidebarItem';

const log = Logger.create();

const Styles: IStyleMap = {

    sidebar: {
        position: 'absolute',
        top: 0,
        left: 0,
        // display: 'none',
        backgroundColor: '#fff',
        zIndex: 999,
        height: 'calc(100%)',
        width: '200px',
        paddingLeft: '1px',
        paddingTop: '1px'
    },

    subheader: {
        display: 'table'
    },

    subheaderItem: {
        display: 'inline-block',
        paddingRight: '5px',
    }

};

/**
 * Simple header for the repository which supports arbitrary children.
 */
export class RepoSidebar extends React.Component<IProps, IState> {

    constructor(props: IProps, context: any) {
        super(props, context);

        this.state = {
            expanded: false
        };

        window.addEventListener('keyup', event => {

            if (event.key === "Escape") {

                if (this.state.expanded) {
                    this.setState({ expanded: false });
                }

            }

        });

    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any): void {

        if (prevState.expanded !== this.state.expanded) {
            Blackout.toggle(this.state.expanded);
        }

    }

    public render() {

        const display = this.state.expanded ? 'block' : 'none';

        const sidebarStyle = Object.assign({}, Styles.sidebar, {display});

        return (

            <div className="repo-sidebar">

                <div>

                    <div style={Styles.subheaderItem}>
                        <Button color='light'
                                onClick={() => this.toggle()}>
                            <i className="fas fa-bars"></i>
                        </Button>
                    </div>

                    <NavLogo/>

                </div>

                {/*Rework this so that I can accept the ESC key binding here.*/}
                {/*https://stackoverflow.com/questions/37440408/how-to-detect-esc-key-press-in-react-and-how-to-handle-it/46123962*/}

                <section className="sidebar"
                         style={sidebarStyle}
                         onKeyUp={event => this.onKeyUp(event)}>

                    <div className="subheader p-1" style={Styles.subheader}>

                        <div style={Styles.subheaderItem}>
                            <Button onClick={() => this.toggle()}
                                    color='light'>

                                <i className="fas fa-bars"></i>

                            </Button>
                        </div>

                        <NavLogo/>

                    </div>

                    <ListGroup flush>

                        <RepoSidebarItem href="#"
                                         onClick={() => this.toggle()}
                                         iconClassName="fas fa-archive"
                                         text="Documents"/>

                        <RepoSidebarItem href="#annotations"
                                         onClick={() => this.toggle()}
                                         iconClassName="fas fa-layer-group"
                                         text="Annotations"/>

                        <RepoSidebarItem href="#stats"
                                         onClick={() => this.toggle()}
                                         iconClassName="fas fa-chart-line"
                                         text="Stats"/>

                        <RepoSidebarItem href="#community"
                                         onClick={() => this.toggle()}
                                         iconClassName="fas fa-hands-helping"
                                         text="Community"/>

                        <RepoSidebarItem href="#whats-new"
                                         onClick={() => this.toggle()}
                                         iconClassName="fas fa-bullhorn"
                                         text="Whats New"/>

                    </ListGroup>

                </section>
            </div>

        );

    }

    private onKeyUp(event: React.KeyboardEvent<HTMLElement>) {

        console.log("got event", event);

    }

    private toggle() {

        const expanded = ! this.state.expanded;

        Blackout.toggle(expanded);

        this.setState({
            expanded
        });
    }

}

interface IProps {
}

interface IState {
    readonly expanded: boolean;
}
