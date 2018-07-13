import gql from 'graphql-tag';

export default gql`
query AllNotesQuery {
  allNotes {
    __typename
    id
    text
    url
  }
}`;