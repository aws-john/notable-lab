import gql from 'graphql-tag';

export default gql`
mutation UpdateNoteMutation($id: ID!, $text: String, $url: String) {
    updateNote(
        id: $id
        text: $text
        url: $url
    ) {
        __typename
        id
        text
        url
    }
}`;