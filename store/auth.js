export const state = () => ({
  loggedIn: false,
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
  toggleUser: (state) => {
    if (state.user.name === 'Cameron') {
      state.user = {
        id: '1',
        name: 'Felix Schwarz',
        email: '',
        gitName: 'feritarou',
        gitEmail: 'schwarz.f@web.de'
      }
    } else {
      state.user = {
        id: '2',
        name: 'Cameron',
        email: '',
        gitName: 'cameron',
        gitEmail: 'cameron@fake.com'
      }
    }
  },
  login: (state, { user, token }) => {
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
    state.invalidCredentials = true
  }
}

export const actions = {
  async requestLogin ({ commit }, [userName, password]) {
    const response = await this.$axios.$post('auth-token', { userName, password })
    if (response.success) {
      commit('openWebSocket', null, { root: true })
      commit('login', response)
    } else {
      commit('invalidCredentials')
    }
  },
  async requestLogout ({ commit, state }) {
    commit('closeWebSocket')
    await this.$axios.$delete('auth-token', { params: { token: state.token } })
    commit('logout')
  }
}
