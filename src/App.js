import React, { Component } from 'react';
import './App.css';
import Amplify, { Auth } from 'aws-amplify';
import { graphql, ApolloProvider, compose } from 'react-apollo';
import { withAuthenticator } from 'aws-amplify-react';
import AWSAppSyncClient from 'aws-appsync';
import { Rehydrated } from 'aws-appsync-react';
import config from './aws-exports';
import AppSync from './AppSync.js';

// components
import AddNote from './components/AddNote';
import AllNotes from './components/AllNotes';

// appsync integration
import NewNoteMutation from './graphql/NewNoteMutation';
import DeleteNoteMutation from './graphql/DeleteNoteMutation';
import UpdateNoteMutation from './graphql/UpdateNoteMutation';
import AllNotesQuery from './graphql/AllNotesQuery';

const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE;

Amplify.configure(config);

const client = new AWSAppSyncClient({
    url: AppSync.graphqlEndpoint,
    region: AppSync.region,
    auth: {
        // Amazon Cognito Federated Identities using AWS Amplify
        //credentials: () => Auth.currentCredentials(),
        // COGNITO USER POOLS
        type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
        credentials: () => Auth.currentCredentials(),
        jwtToken: async () => (await Auth.currentSession()).getAccessToken().getJwtToken()
    },
    complexObjectsCredentials: () => Auth.currentCredentials(),
    disableOffline: false
});

const notes = [];

const AllNotesWithData = compose(
    graphql(AllNotesQuery, {
        options: {
            fetchPolicy: 'cache-and-network'
        },
        props: (props) => ({
            notes: props.data.allNotes,
        })
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
    graphql(UpdateNoteMutation, {
        props: (props) => ({
            onEdit: (note) => {
                props.mutate({
                    variables: { ...note },
                    optimisticResponse: () => ({ updateNote: { ...note, __typename: 'Note' } }),
                })
            }
        }),
        options: {
            refetchQueries: [{ query: AllNotesQuery }],
            update: (dataProxy, { data: { updateNote } }) => {
                const query = AllNotesQuery;
                const data = dataProxy.readQuery({ query });

                data.allNotes = data.allNotes.map(note => note.id !== updateNote.id ? note : { ...updateNote });

                dataProxy.writeQuery({ query, data });
            }
        }
    })
)(AllNotes);

const NewNoteWithData = graphql(NewNoteMutation, {
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
            console.log(client);
            const data = dataProxy.readQuery({ query });
            data.allNotes.push(newNote);
            // console.log("about to writeQuery");
            // dataProxy.writeQuery({ query, data });
            // console.log("wrote");
        }
    }
})(AddNote);

class App extends Component {
    state = { notes };

    async componentWillMount() {
        await client.initQueryManager();
        console.log(client);
        await client.resetStore();
    }

    handleOnAdd = (note) => {
        const { notes } = this.state;

        this.setState({
            notes: [...notes, note]
        });
    };

    handleOnUpdate = (note) => {
        const { notes } = this.state;

        console.log('saveEditedNote', note);
    };

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">notable</h1>
                </header>
                <p className="App-intro">
                </p>
                <NewNoteWithData onAdd={this.handleOnAdd} onUpdate={this.handleOnUpdate} />
                <AllNotesWithData notes={notes} onRef={ref => (this.noteListComponent = ref)} />
            </div>
        );
    }
}

const WithProvider = () => (
    <ApolloProvider client={client}>
        <Rehydrated>
            <App />
        </Rehydrated>
    </ApolloProvider>
);

export default withAuthenticator(WithProvider, { includeGreetings: true });
