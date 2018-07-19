import gql from 'graphql-tag'

export default gql`
  subscription UpdateNoteSubscription {
    onUpdateNote {
      id
      text
      url
    }
  }
`