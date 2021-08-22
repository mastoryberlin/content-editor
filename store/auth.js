export const state = () => ({
  loggedIn: true,
  isRequestingLogin: false,
  invalidCredentials: false,
  user: {
    id: '1',
    name: 'Felix Schwarz',
    email: '',
    gitName: 'feritarou',
    gitEmail: 'schwarz.f@web.de'
  },
  token: null
})

export const getters = {
  userName: state => state.user.name,
  initials: (state, getters) => {
    const [first, last] = getters.userName.split(' ')
    if (first && last) {
      return (first.substr(0, 1) + last.substr(0, 1)).toUpperCase()
    } else if (first) {
      return first.substr(0, 2).toUpperCase()
    } else if (last) {
      return last.substr(0, 2).toUpperCase()
    } else {
      return '??'
    }
  }
}

export const mutations = {
  login: (state, { user, token }) => {
    state.isRequestingLogin = false
    state.loggedIn = true
    state.token = token
    state.user = { ...user }
    state.invalidCredentials = false
  },
  logout: (state) => {
    state.loggedIn = false
    state.token = null
    state.invalidCredentials = false
  },
  invalidCredentials: (state) => {
    state.isRequestingLogin = false
    state.invalidCredentials = true
  },
  beginLoginRequest: (state) => {
    state.isRequestingLogin = true
  }
}

export const actions = {
  async requestLogin ({ commit, dispatch }, [userName, password]) {
    commit('beginLoginRequest')
    const response = await this.$axios.$post('auth-token', { userName, password })
    if (response.success) {
      dispatch('websocket/open', null, { root: true })
      commit('login', response)
    } else {
      commit('invalidCredentials')
    }
  },
  async requestLogout ({ commit, state, dispatch }) {
    dispatch('websocket/close', null, { root: true })
    await this.$axios.$delete('auth-token', { params: { token: state.token } })
    commit('logout')
  }
}
