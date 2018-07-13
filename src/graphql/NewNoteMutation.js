import gql from 'graphql-tag';

export default gql`
mutation AddNoteMutation($text: String!, $url: String!) {
    newNote(
        text: $text
        url: $url
    ) {
        id
        text
        url
    }
}`;