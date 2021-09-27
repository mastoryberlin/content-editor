export const state = () => ({
  ws: null
})

export const getters = {
  isConnected: state => !!state.ws
}

export const mutations = {
  storeConnection: (state, ws) => {
    state.ws = ws
  }
}

export const actions = {
  async open ({ rootState, commit }) {
    // const url = (
    //   process.env.BACKEND === 'local'
    //     ? 'ws://localhost:4000'
    //     : 'wss://proc.mastory.io'
    // ) + '/content'
    const url = 'ws://localhost:4000/content'
    const ws = await new WebSocket(url)
    ws.onopen = () => {
      console.log('WebSocket connection established!')
      ws.send(JSON.stringify({
        token: rootState.auth.token,
        action: 'retrieve',
        where: '',
        payload: 'stories'
      }))
    }
    ws.onclose = () => {
      console.log('WebSocket connection closed!')
    }
    ws.onmessage = (payload) => {
      const msg = JSON.parse(payload.data)
      console.log('WS server says', msg)
      switch (msg.event) {
        case 'updateStories':
          commit('initializeStories', msg.data, { root: true })
          break
        case 'lock':
          commit('setEditedBy', { who: msg.editor, element: msg.element }, { root: true })
          break
        case 'unlock':
          commit('setEditedBy', { who: null, element: msg.element }, { root: true })
          break
        case 'changeEpisode':
          commit('changeEpisode', { id: msg.id, element: msg.element, to: msg.to }, { root: true })
          break
        case 'addEpisode':
          commit('addEpisode', msg, { root: true })
          break
      }
    }
    commit('storeConnection', ws)
    commit('autosave/startStatusChecker', commit, { root: true })
  },
  close ({ state, commit }) {
    const ws = state.ws
    if (ws) {
      ws.close()
      commit('autosave/stopStatusChecker', null, { root: true })
      commit('storeConnection', null)
    }
  },
}
