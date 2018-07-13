import gql from 'graphql-tag';

export default gql`
mutation DeleteNoteMutation($id: ID!) {
    deleteNote(id: $id) {
        __typename
        id
        text
        url
    }
}`;