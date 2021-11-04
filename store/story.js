export const state = () => ({
  characters: [],
  storyId: '',
})

export const getters = {
  npcs: state => Object.fromEntries(
    state.characters.map(c => ([c.id, c.picture_url]))
  ),
}

export const mutations = {
  setCharacters: (state, characters) => {
    state.characters = [...characters]
  },
  setID: (state, storyId) => {
    state.storyId = storyId
  },
}

export const actions = {
}
