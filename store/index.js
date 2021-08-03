function sleep (milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export default {
  state: () => ({
    stories: [
      {
        id: 'demo',
        title: 'Technical Demo',
        children: [
          {
            id: 'demo/episode',
            title: 'Demo Episode'
          }
        ]
      },
      {
        id: 'the-cloud',
        title: 'The Cloud',
        children: [
          {
            id: 'the-cloud/e1',
            title: 'Introduction to the Professor',
            specs: 'The Professor says hi'
          },
          {
            id: 'the-cloud/e2',
            title: 'Something went wrong',
            specs: 'Alicia gets kidnapped by aliens'
          }
        ]
      }
    ],
    isCommittingChanges: false
  }),
  mutations: {
    initializeStories: (state, retrievedStories) => {
      state.stories = retrievedStories
    },
    moveEpisode: (state, { story, fromIndex, toIndex }) => {
      const st = state.stories.find(s => s.id === story)
      const movedEpisode = st.children[fromIndex]
      const newItems = [...st.children]
      newItems.splice(fromIndex, 1)
      newItems.splice(toIndex, 0, movedEpisode)
      st.children = newItems
    },
    changeEpisode: (state, { id, element, to }) => {
      const [story] = id.split('/')
      const st = state.stories.find(s => s.id === story)
      const ep = st.children.find(e => e.id === id)
      ep[element] = to
    },
    addEpisode: (state, { after, duplicate }) => {
      const [story] = after.id.split('/')
      const st = state.stories.find(s => s.id === story)
      const eps = st.children
      const i = eps.indexOf(after)
      let newIndex = eps.length + 1
      let newID = story + '/e' + newIndex
      while (eps.find(e => e.id === newID)) {
        newIndex += 1
        newID = story + '/e' + newIndex
      }
      const newEp = duplicate
        ? { ...after, id: newID }
        : { id: newID, title: '', specs: '' }
      st.children.splice(i + 1, 0, newEp)
    },
    deleteEpisode: (state, episode) => {
      const [story] = episode.id.split('/')
      const st = state.stories.find(s => s.id === story)
      const eps = st.children
      const i = eps.indexOf(episode)
      if (confirm(`Are you sure you want to delete episode ${i + 1}, '${episode.title}'?`)) {
        st.children.splice(i, 1)
      }
    },
    beginCommittingChanges: (state) => {
      state.isCommittingChanges = true
    },
    endCommittingChanges: (state) => {
      state.isCommittingChanges = false
    }
  },
  actions: {
    // async nuxtServerInit ({ commit }) {
    //   const retrievedStories = (
    //     await this.$axios.$get('stories')
    //   ).stories
    //   commit('initializeStories', retrievedStories)
    // },
    async commitChanges ({ commit, state }) {
      commit('beginCommittingChanges')
      await sleep(500)
      alert('Save the following JSON to a file:\n' + JSON.stringify(state.stories))
      commit('endCommittingChanges')
    }
  }
}
