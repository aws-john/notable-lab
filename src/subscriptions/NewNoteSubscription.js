import gql from 'graphql-tag'

export default gql`
  subscription NewNoteSubscription {
    onNewNote {
      id
      text
      url
    }
  }
`