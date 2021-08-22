/* eslint-disable */
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'

const getHeaders = () => {
  const headers = {
    // 'X-Hasura-Role': 'teacher',
    // 'x-hasura-user-token': '8ac3a21e-cf14-4900-ab21-623a11687c9a'
    'x-hasura-admin-secret': '4e46fee975cf7a5daa6ed584c182d5b0ec9cba297015d692'
  }
  // const token = window.localStorage.getItem('apollo-token')
  // if (token) {
  //   headers.authorization = `Bearer ${token}`
  //   headers['X-Hasura-User-Token'] = token
  // }
  return headers
}

const httpLink = new HttpLink({
  uri: 'https://dev-graphql-engine.mastory.io/v1/graphql',
  // credentials: 'same-origin',
  headers: getHeaders()
})

let link
if (process.server) {
  // Server side
//   const ws = require('ws')
//   wsLink = new WebSocketLink({
//     uri: 'wss://dev-graphql-engine.mastory.io/v1/graphql',
//     options: {
//       reconnect: true,
//       connectionParams () {
//         return {
//           headers: getHeaders()
//         }
//       }
//     },
//     webSocketImpl: ws
//   })
  link = httpLink
} else {
  // Client side
  const wsLink = new WebSocketLink({
    uri: 'wss://dev-graphql-engine.mastory.io/v1/graphql',
    options: {
      reconnect: true,
      connectionParams () {
        return {
          headers: getHeaders()
        }
      }
    }
  })

  link = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query)
      return kind === 'OperationDefinition' && operation === 'subscription'
    },
    wsLink,
    httpLink
  )
}

export default function (context) {
  return {
    link,
    // typeDefs: require('~/graphql/typedefs.gql'),
    // resolvers: {},
    defaultHttpLink: false,
    cache: new InMemoryCache()
  }
}
