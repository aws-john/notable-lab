import React, { Component } from 'react';
import { v4 as uuid } from 'uuid';
import NoteRecorder from './NoteRecorder';
import { Storage } from 'aws-amplify';
import { graphql } from 'react-apollo';

import NewNoteMutation from '../graphql/NewNoteMutation';
import AllNotesQuery from '../graphql/AllNotesQuery';

class AddNote extends Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    static defaultProps = {
        onAdd: () => null
    }

    getInitialState = () => ({
        id: uuid().replace(/-/g, ''),
        text: '-',
        url: '',
    });

    handleChange = (field, event) => {
        const { target: { value } } = event;

        this.setState({
            [field]: value
        });
    }

    handleAdd = () => {
        const { id, text, url } = this.state;
        this.setState(this.getInitialState(), () => {
            this.props.onAdd({ id, text, url });
        });
    }

    handleUpdate = () => {
        const { id, text, url } = this.state;
        this.setState(this.getInitialState(), () => {
            this.props.onUpdate({ id, text, url });
        });
    }

    handleCancel = () => {
        this.setState(this.getInitialState());
    }

    handleOnEndRecording = (audioBlob) => {
        let self = this;
        let fileReader = new FileReader();
        let arrayBuffer;
        let noteText = '-';
        let noteID = uuid().replace(/-/g, '');

        // upload the compressed audio stream from the microphone
        // - do this first for UI
        Storage.put(noteID + '.ogg', audioBlob, {
                level: 'public',
                contentType: 'audio/ogg'
            })
            .then((result) => {
                console.log(result);
                Storage.get(noteID + '.ogg', { level: 'public' })
                    .then(result => {
                        console.log('uploaded compressed stream');
                        // create a new note with an 'empty' url marker
                        self.setState({
                            id: noteID,
                            text: noteText,
                            url: result
                        });
                        self.handleAdd();
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => {
                console.log('error', err);
            });

        // this is called when the audio data has been decoded
        // which we can then convert to a wav file for upload to
        // S3 (this in turn will be consumed by Transcribe)

        fileReader.onloadend = () => {
            let toWav = require('audiobuffer-to-wav');
            let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

            arrayBuffer = fileReader.result;

            audioCtx.decodeAudioData(arrayBuffer).then(function (decodedData) {
                // use the decoded data here
                var wav = toWav(decodedData);

                let noteFilename = noteID + '.wav';

                Storage.put(noteFilename, wav, {
                        level: 'public',
                        contentType: 'audio/wav'
                    })
                    .then((result) => {
                         Storage.get(noteFilename, { level: 'public' })
                            .then(result => {
                                console.log('wav file: ', result)
                            })
                            .catch(err => console.log(err));
                    })
                    .catch(err => {
                        console.log('error');
                        console.log(err);
                    });
            });
        }

        console.log('b');

        fileReader.readAsArrayBuffer(audioBlob);
    }

    render() {
        return (
            <div>
                <NoteRecorder
                    onEndRecording={this.handleOnEndRecording}
                />
            </div>
        );
    }
}

export default graphql(NewNoteMutation, {
    props: (props) => ({
        onAdd: note => props.mutate({
            variables: note,
            optimisticResponse: () => ({ newNote: { id: '', 'text': note.text, 'url': note.url, __typename: 'Note' } }),
        })
    }),
    options: {
        refetchQueries: [{ query: AllNotesQuery }],
        update: (dataProxy, { data: { newNote } }) => {
            console.log(AllNotesQuery);
            const query = AllNotesQuery;

            console.log("about to readQuery");
            // console.log(this.props.client);
            const data = dataProxy.readQuery({ query });
            data.allNotes.push(newNote);
        }
    }
})(AddNote);
