import gql from 'graphql-tag';

export default gql`
mutation ModifyNoteMutation($id: ID, $text: String, $url: String) {
    modifyNote(
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