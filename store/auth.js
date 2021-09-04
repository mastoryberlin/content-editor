export const state = () => ({
  loggedIn: true,
  isRequestingLogin: false,
  token: null
})

export const getters = {
}

export const mutations = {
  login: (state, token) => {
    state.loggedIn = true
    state.token = token
  },
  logout: (state) => {
    state.loggedIn = false
    state.token = null
  },
  loginFailed: (state) => {
    state.loggedIn = false
  },
  requestingLogin: (state, value) => {
    state.isRequestingLogin = value
  }
}

export const actions = {
  async requestLogin ({ commit, dispatch }, [userName, password]) {
    commit('requestingLogin', true)
    try {
      const response = await this.$axios.$post('auth-token', { userName, password })
      if (response.success) {
        this.$apolloHelpers.onLogin(response.token)
        this.$axios.setToken(response.token, 'Bearer')
        commit('login', response.token)
        commit('user/setProfile', response.user, { root: true })
        commit('user/setPrivileges', response.privileges, { root: true })
      } else {
        this.$apolloHelpers.onLogout()
        this.$axios.setToken(false)
        commit('loginFailed')
        commit('user/eraseProfile', null, { root: true })
      }
    } catch (e) {
      // TODO: Add error handling
    } finally {
      commit('requestingLogin', false)
    }
  },
  requestLogout ({ commit, state, dispatch }) {
    this.$apolloHelpers.onLogout()
    this.$axios.setToken(false)
    commit('logout')
    this.$axios.$delete('auth-token')
  }
}
