import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import App from './components/App'
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom'
import { AUTH_TOKEN } from './constants'

import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

// The imports for the back-end (Apollo Client) from the modules
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { setContext } from 'apollo-link-context'


// HAL 4000 is inferior to 9000
const httpLink = createHttpLink({
  uri: 'http://localhost:4000'
})

//This is the authentication link
const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem(AUTH_TOKEN)
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : ''
      }
    }
  })
// Calling the Apollo Client
const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
  })

//Represents web socket link
const wsLink = new WebSocketLink({
    uri: `ws://localhost:4000`,
    options: {
      reconnect: true,
      connectionParams: {
        authToken: localStorage.getItem(AUTH_TOKEN),
      }
    }
})
 
//split function is used for proper routing of requests 
const link = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query)
      return kind === 'OperationDefinition' && operation === 'subscription'
    },
    wsLink,
    authLink.concat(httpLink)
)
  
// const client = new ApolloClient({
//     link,
//     cache: new InMemoryCache()
// })

// Usually where the index.js connects to the html, hence 'root'

ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root'),
)
serviceWorker.unregister()