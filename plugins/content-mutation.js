import './extensions.js'

const CONTENT_DB_NAMES = {
  story: 'story',
  episode: 'story_chapter',
  phase: 'story_section',
  message: 'prompt',
  challenge: 'challenge',
  worksheet: 'geogebra_worksheet',
  survey: 'survey',
  question: 'survey_question',
  topic: 'topic',
  intent: 'intent',
  subintent: 'subintent',
  replica: 'replica',
}

export default ({ app }, inject) => {
  inject('db', {
    $apollo: app.apolloProvider.defaultClient,

    async add(hierarchyData, parent = null, previous = null, variables = {}, parentId = null) {
      let resp

      const keys = Object.keys(hierarchyData)
      for (const key of keys) {
        console.log('[content-mutation] adding a ' + key)
        if (!['story', 'topic'].includes(key)) {
          const parentIdVarName = parent + 'Id'
          if (parentId) {
            variables[parentIdVarName] = parentId
          } else {
            throw new Error('Cannot add ' + key + ': parentId parameter must not be null')
          }
        }
        resp = await app.apolloProvider.defaultClient.mutate({
          mutation: require('~/graphql/Add' + key.toCamelCase()),
          variables,
        })
        if (hierarchyData[key] !== true) {
          const dataField = 'insert_' + CONTENT_DB_NAMES[key] + '_one'
          const id = resp.data[dataField].id
          this.add(hierarchyData[key], key, null, {}, id)
        }
      }
      return resp
    },

    async delete(hierarchyData, parent, element, parentId) {
      const keys = Object.keys(hierarchyData)
      const id = element.id

      for (const key of keys) {
        let variables = {}
        const childKeys = Object.keys(hierarchyData[key])
        variables[key + 'Id'] = id
        for (const childKey of childKeys) {
          const childField = CONTENT_DB_NAMES[childKey]
          const { data } = await this.$apollo.query({
            query: require('~/graphql/GetAll' + childKey.toCamelCase() + 's'),
            variables,
          })
          const objs = data[childField]
          objs.forEach((el) => {
            this.delete(hierarchyData[key], key, el, id)
          })
        }
        variables = { id }
        if (element.number && ['episode', 'phase', 'message', 'question', 'worksheet'].includes(key)) {
          variables.number = element.number
        }
        if (!['story', 'survey', 'topic', 'replica', 'challenge', 'intent', 'subintent'].includes(key)) {
          const parentField = CONTENT_DB_NAMES[parent]
          variables[parent + 'Id'] = parentId || element[parent + 'Id'] || element[parentField].id
        }
        await this.$apollo.mutate({
          mutation: require('~/graphql/Delete' + key.toCamelCase()),
          variables,
        })
      }
    },
  })
}
