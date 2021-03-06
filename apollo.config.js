/* eslint-disable */
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'

const getHeaders = () => {
  const headers = {
    'x-hasura-admin-secret': process.env.NUXT_ENV_HASURA_ADMIN_SECRET
  }
  // const token = window.localStorage.getItem('apollo-token')
  // if (token) {
  //   headers.authorization = `Bearer ${token}`
  //   headers['X-Hasura-User-Token'] = token
  // }
  return headers
}

const path = process.env.NUXT_ENV_HASURA_URL + process.env.NUXT_ENV_HASURA_ENDPOINT
const httpLink = new HttpLink({
  uri: 'https://' + path,
  // credentials: 'same-origin',
  headers: getHeaders()
})

let link
if (process.server) {
  link = httpLink
} else {
  // Client side
  const wsLink = new WebSocketLink({
    uri: 'wss://' + path,
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
