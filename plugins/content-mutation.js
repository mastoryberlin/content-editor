import './extensions.js'

const CONTENT_LAYERS = ['story', 'episode', 'phase', 'message']
const DB_NAMES = ['story', 'story_chapter', 'story_section', 'prompt']

export default ({ app }, inject) => {
  inject('db', {
    async add (type, previous = null, variables = {}, parentId = null) {
      console.log('adding a ' + type)
      // TODO: Implement proper number handling with previous param

      const layer = CONTENT_LAYERS.indexOf(type)
      let childType

      if (layer < 3) {
        const childLayer = layer + 1
        childType = CONTENT_LAYERS[childLayer]
      }
      if (layer > 0) {
        const parentIdVarName = CONTENT_LAYERS[layer - 1] + 'Id'
        if (parentId) {
          variables[parentIdVarName] = parentId
        } else {
          throw new Error('Cannot add ' + type + ': parentId parameter must not be null')
        }
      }

      const resp = await app.apolloProvider.defaultClient.mutate({
        mutation: require('~/graphql/Add' + type.toCamelCase()),
        variables
      })

      if (layer < 3) {
        // As content follows a hierarchic structure that allows no empty items,
        // add a first item for all lower nesting levels recursively
        const dataField = 'insert_' + DB_NAMES[layer] + '_one'
        const id = resp.data[dataField].id
        this.add(childType, {}, id)
      }
    }
  })
}
