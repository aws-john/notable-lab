import React, { Component } from "react";
import { graphql, compose } from 'react-apollo';
import { Storage } from 'aws-amplify';

// appsync integration
import AllNotesQuery from '../graphql/AllNotesQuery';
import DeleteNoteMutation from '../graphql/DeleteNoteMutation';
import ModifyNoteMutation from '../graphql/ModifyNoteMutation';
import NewNoteSubscription from "../subscriptions/NewNoteSubscription";

class AllNotes extends Component {
    componentDidMount() {
        this.props.onRef(this)
    }

    constructor(props) {
        super(props);

        this.state = {
            editing: {},
            updatedNotes: []
        }

        console.log('notes: ', this.props.notes);

        setInterval(() => {
            for(let note of this.props.notes) {
                let txtURL = '';

                if (note.text === '-') {
                    let tmp = note.url.replace(".ogg", ".txt");
                    console.log(tmp.split("?")[0].split("/"));
                    tmp = tmp.split("?")[0].split("/")[5];
                    let noteFilename = tmp;
                    console.log('noteFilename', noteFilename);
                    Storage.get(noteFilename, { level: 'private' })
                    .then(result => {
                        console.log('txt file: ', result);
                        txtURL = result;
                        fetch(txtURL).then((response) => {
                            if (response.status === 200) {
                                response.text().then((transcription) => {
                                    console.log(transcription);
                                    let updatedNote = {...note, text: transcription};
    
                                    if (note.text !== updatedNote.text) {
                                        console.log('adding updated note to queue');
                                        if (updatedNote.text === '')
                                            updatedNote.text = "/";
                                        this.state.updatedNotes = [...this.state.updatedNotes, updatedNote];
                                    }
                                });
                            } else {
                                console.log(response);
                            } 
                        });
                    })
                    .catch(err => console.log(err));
                }
            }

            console.log('updatedNotes: ', this.state.updatedNotes);

            for (let note of this.state.updatedNotes) {
                console.log('updating: ', note);
                this.props.onEdit(note);
            }

            this.state.updatedNotes = [];
        }, 5000);
    }

    static defaultProps = {
        notes: [],
        onDelete: () => null,
        onEdit: () => null,
    }

    handleDelete = (note) => {
        if (window.confirm('Are you sure')) {
            console.log(note);

            this.props.onDelete(note);

            let noteID = note.url.replace('.ogg', '');
            noteID = noteID.split('?')[0];
            noteID = noteID.split('public/')[1];

            console.log('removing: ', noteID + '.ogg');

            Storage.remove(noteID + '.ogg', {
                level: 'public'
            })
            .then((result) => {
                console.log('removed ogg: ', result);
                Storage.remove(noteID + '.wav', {
                    level: 'public'
                })
                .then((result) => {
                    Storage.remove(noteID + '.txt', {
                        level: 'public'
                    })
                    .then((result) => {
                    });
                });
            })
            .catch((err) => {
                console.log(err);
            });
    }
    }

    handleEdit = (note) => {
        const { editing } = this.state;

        this.setState({ editing: { ...editing, [note.id]: { ...note } } });
    }

    handleEditCancel = (id) => {
        const { editing } = this.state;
        const { [id]: curr, ...others } = editing;

        this.setState({ editing: { ...others } });
    }

    handleFieldEdit = (id, field, event) => {
        const { target: { value } } = event;
        const { editing } = this.state;
        const editData = { ...editing[id] };

        editData[field] = value;

        this.setState({
            editing: { ...editing, ...{ [id]: editData } }
        });
    }

    handleEditSave = (id) => {
        const { editing } = this.state;
        const { [id]: editedNote, ...others } = editing;

        console.log('editedNote: ', editedNote);
        this.props.onEdit({ ...editedNote });

        this.setState({
            editing: { ...others }
        });
    }

    saveEditedNote = (note) => {
        const { editing } = this.state;
        const { [note.id]: editedNote, ...others } = editing;

        this.props.onEdit({ ...editedNote });

        this.setState({
            editing: { ...others }
        });
    }

    renderOrEditNote = (note) => {
        const { editing } = this.state;

        const editData = editing[note.id];
        const isEditing = !!editData;

        return (
            !isEditing ?
                (
                    <tr key={note.id}>
                        <td>
                            {note.url === '-' ? (
                                '…'
                            ) : (
                                <audio controls>
                                    <source src={note.url} type='audio/wav' />
                                </audio>
                            )}
                        </td>
                        <td>                            
                            {note.text === '/' ? (
                                <i>empty</i>
                            ) : (
                                note.text === '-' ? (
                                    <div className='load-2'>
                                        <div className='line'></div>
                                    </div>
                                ) : (
                                    note.text
                                )
                            )}
                        </td>
                        <td>
                            <a className="btn red" onClick={this.handleDelete.bind(this, note)}>Delete</a>
                        </td>
                    </tr>
                ) : (
                    <tr key={note.id}>
                        <td>
                            {note.id}
                        </td>
                        <td>
                            <input type="text" value={editData.text} onChange={this.handleFieldEdit.bind(this, note.id, 'text')} />
                        </td>
                        <td>
                            <input type="text" value={editData.url} onChange={this.handleFieldEdit.bind(this, note.id, 'url')} />
                        </td>
                        <td>
                            <button onClick={this.handleEditSave.bind(this, note.id)}>Save</button>
                            <button onClick={this.handleEditCancel.bind(this, note.id)}>Cancel</button>
                        </td>
                    </tr>
                )
        );
    }

    render() {
        const { notes } = this.props;

        return (<table width="100%">
            <thead>
                <tr>
                    <th>Voice Note</th>
                    <th>Transcript</th>
                </tr>
            </thead>
            <tbody>
                {[].concat(notes).sort((a, b) => b.id - a.id).map(this.renderOrEditNote)}
            </tbody>
        </table>);
    }
}

export default compose(
    graphql(AllNotesQuery, {
        props: (props) => ({
            notes: props.data.allNotes,
            subscribeToNewNotes: params => {
                props.data.subscribeToMore({
                    document: NewNoteSubscription,
                    updateQuery: (prev, { subscriptionData: { data : { onNewNote } } }) => {
                        console.log('new note');
                        return {
                            ...prev,
                            listNotes: {
                                __typename: 'NoteConnection',
                                items: [onNewNote, ...prev.listNotes.items.filter(note => note.id !== onNewNote.id)]
                            }
                        }
                    }
                })
            }
        }),
        options: {
            fetchPolicy: 'cache-and-network'
        }
    }),
    graphql(DeleteNoteMutation, {
        props: (props) => ({
            onDelete: (note) => props.mutate({
                variables: { id: note.id },
                optimisticResponse: () => ({ deleteNote: { ...note, __typename: 'Note' } }),
            })
        }),
        options: {
            refetchQueries: [{ query: AllNotesQuery }],
            update: (proxy, { data: { deleteNote: { id } } }) => {
                const query = AllNotesQuery;
                const data = proxy.readQuery({ query });
                data.allNotes = data.allNotes.filter(note => note.id !== id);
                proxy.writeQuery({ query, data });
            }
        }
    }),
    graphql(ModifyNoteMutation, {
        props: (props) => ({
            onEdit: (note) => {
                console.log("onEdit: ", note);
                props.mutate({
                    variables: { ...note },
                    optimisticResponse: { modifyNote: {...note, __typename: 'Note'} }
                });
            }
        }),
        options: {
            refetchQueries: [{ query: AllNotesQuery }],
            update: (dataProxy, { data: { modifyNote } }) => {
                const query = AllNotesQuery;
                const data = dataProxy.readQuery({ query });
                data.allNotes = data.allNotes.map(note => note.id !== modifyNote.id ? note : { ...modifyNote });
                dataProxy.writeQuery({ query, data });
                return null;
            }
        }
    })
)(AllNotes);
