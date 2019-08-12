import React from 'react';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';

const GET_MESSAGES = gql`
  query {
    GetSomething {
      id
      content
    }
  }
`;

const MESSAGE_CREATED = gql`
  subscription {
    SomethingChanged {
      id
      content
    }
  }
`;

const ADD_MESSAGE = gql`
  mutation PostMutation($content: String, $id: String) {
    AddSomething(content: $content, id: $id ) {
      id
      content
    }
  }
`;

const App = () => (
  <Query query={GET_MESSAGES}>
    {({ data, loading, subscribeToMore }) => {
      if (!data) {
        return null;
      }

      if (loading) {
        return <span>Loading ...</span>;
      }

      return (
        <Messages
          GetSomething={data.GetSomething}
          subscribeToMore={subscribeToMore}
        />
      );
    }}
  </Query>
);

class Messages extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      content: "This is content"
    }
  }

  componentDidMount() {
    this.props.subscribeToMore({
      document: MESSAGE_CREATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        return {
          GetSomething: [
            ...prev.GetSomething,
            subscriptionData.data.SomethingChanged,
          ],
        };
      },
    });
  }

  render() {
    return (
      <div>
        <ul>
          {this.props.GetSomething.map(message => (
            <li key={message.id}>{message.content}</li>
          ))}
        </ul>
        <input onChange={(e) => this.setState({ content: e.target.value })} />
        <Mutation mutation={ADD_MESSAGE} variables={ { content: this.state.content, id: new Date().toString() } }>
          {postMutation => (
            <button onClick={postMutation}>Submit</button>
          )}
        </Mutation>
      </div>
    );
  }
}

export default App;
