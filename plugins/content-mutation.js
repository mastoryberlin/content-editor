import './extensions.js'

const CONTENT_LAYERS = ['story', 'episode', 'phase', 'message', 'challenge',
  'worksheet', 'survey', 'question', 'topic', 'intent', 'subintent', 'replica']
const DB_NAMES = ['story', 'story_chapter', 'story_section', 'prompt', 'challenge',
  'worksheet', 'survey', 'question', 'topic', 'intent', 'subintent', 'replica']

export default ({ app }, inject) => {
  inject('db', {
    $apollo: app.apolloProvider.defaultClient,

    async add(type, previous = null, variables = {}, parentId = null) {
      console.log('[content-mutation] adding a ' + type)
      // TODO: Implement proper number handling with previous param

      const layer = CONTENT_LAYERS.indexOf(type)
      let childType

      if (layer < 3) {
        const childLayer = layer + 1
        childType = CONTENT_LAYERS[childLayer]
      }
      // survey has no parent
      // add subintentId for replica
      // add surveyId for question
      // topicId for intent in backend
      if (layer >= 1 && layer <= 3 && !['replica', 'intent', 'survey', 'question'].includes(type)) {
        const parentIdVarName = CONTENT_LAYERS[layer - 1] + 'Id'
        if (parentId) {
          variables[parentIdVarName] = parentId
        } else {
          throw new Error('Cannot add ' + type + ': parentId parameter must not be null')
        }
      }

      const resp = await app.apolloProvider.defaultClient.mutate({
        mutation: require('~/graphql/Add' + type.toCamelCase()),
        variables,
      })

      if (layer < 3) {
        // As content follows a hierarchic structure that allows no empty items,
        // add a first item for all lower nesting levels recursively
        const dataField = 'insert_' + DB_NAMES[layer] + '_one'
        const id = resp.data[dataField].id
        this.add(childType, null, {}, id)
      }
    },

    async delete(type, element, parentId) {
      console.log('[content-mutation] deleting a ' + type)
      const layer = CONTENT_LAYERS.indexOf(type)
      let variables = {}
      const id = element.id

      if (layer < 3) {
        const childLayer = layer + 1
        const childType = CONTENT_LAYERS[childLayer]
        const childField = DB_NAMES[childLayer]
        variables[type + 'Id'] = id
        if (layer < 2) {
          // TODO: Retrieve all child ids from DB and recursively call this.delete for each
          const { data } = await this.$apollo.query({
            query: require('~/graphql/GetAll' + childType.toCamelCase() + 's'),
            variables,
          })
          const objs = data[childField]
          objs.forEach((el) => {
            this.delete(childType, el, id)
          })
        } else {
          // Delete all messages manually
          await this.$apollo.mutate({
            mutation: require('~/graphql/DeleteAll' + childType.toCamelCase() + 's'),
            variables,
          })
        }
      }

      variables = { id: element.id }
      if (type === 'question') {
        variables.survey_id = parentId // add surveyId in backend
      }
      if (element.number) {
        variables.number = element.number
      }
      // topic question survey replica don't need parentId
      if (layer > 0 && !['survey', 'question', 'topic', 'replica'].includes(type)) {
        const parentLayer = layer - 1
        const parentType = CONTENT_LAYERS[parentLayer]
        const parentField = DB_NAMES[parentLayer]
        variables[parentType + 'Id'] = parentId || element[parentType + 'Id'] || element[parentField].id
      }

      await this.$apollo.mutate({
        mutation: require('~/graphql/Delete' + type.toCamelCase()),
        variables,
      })
    },
  })
}
