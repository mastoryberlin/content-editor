export default {
  state: () => ({
    stories: []
  }),
  mutations: {
    initializeStories: (state, retrievedStories) => {
      state.stories = retrievedStories
    }
  },
  actions: {
    async nuxtServerInit ({ commit }) {
      const retrievedStories = (
        await this.$axios.$get('chapters')
      ).chapters
      commit('initializeStories', retrievedStories)
    }
  }
}
