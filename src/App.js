import './App.css';

import React, { Component } from 'react';
import Amplify, { Auth } from 'aws-amplify';
import { ApolloProvider } from 'react-apollo';
import { withAuthenticator } from 'aws-amplify-react';
import AWSAppSyncClient from 'aws-appsync';
import { Rehydrated } from 'aws-appsync-react';
import config from './aws-exports';
import AppSync from './AppSync.js';

// components

import AddNote from './components/AddNote';
import AllNotes from './components/AllNotes';

const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE;

Amplify.configure(config);

const client = new AWSAppSyncClient({
    url: AppSync.graphqlEndpoint,
    region: AppSync.region,
    auth: {
        // Amazon Cognito Federated Identities using AWS Amplify
        // credentials: () => Auth.currentCredentials(),

        type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
        credentials: () => Auth.currentCredentials(),
        jwtToken: async () => (await Auth.currentSession()).getAccessToken().getJwtToken()
    },
    complexObjectsCredentials: () => Auth.currentCredentials(),
    disableOffline: true
});

const notes = [];

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

    handleOnUpdate = (updatedNote) => {
        const { notes } = this.state;
        let updatedNotes = notes.map(currentNote => {
            if (currentNote.id === updatedNote.id)
               return updatedNote;
            return currentNote;
        });
        this.setState({
            notes: updatedNotes
        })
    };

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">NOTABLE</h1>
                </header>
                <p className="App-intro">
                </p>
                <AddNote />
                <AllNotes notes={notes} onUpdate={this.handleOnUpdate} onRef={ref => (this.noteListComponent = ref)} />
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

// wrap the cognito authorisation provider around our app component

export default withAuthenticator(WithProvider, { includeGreetings: true });
