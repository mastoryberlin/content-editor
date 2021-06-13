export default {
  state: () => ({
    chapters: []
  }),
  mutations: {
    initializeChapters: (state, c) => {
      state.chapters = c
    }
  },
  actions: {
    async nuxtServerInit ({ commit }) {
      const chapters = (
        await this.$axios.$get('chapters')
      ).chapters
      commit('initializeChapters', chapters)
    }
  }
}
