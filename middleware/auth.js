export default ({ app, error, redirect, route }) => {
  let token
  if (app) {
    token = app.$apolloHelpers.getToken()
  } else {
    token = null
  }
  if (!token) {
    app.store.commit('auth/logout')
    return redirect('/login?r=' + encodeURIComponent(route.path))
  } else {
    app.$axios.setToken(token, 'Bearer')
    app.store.dispatch('user/queryProfile')
    app.store.dispatch('user/queryPrivileges')
    app.store.commit('auth/login', token)
  }
}
