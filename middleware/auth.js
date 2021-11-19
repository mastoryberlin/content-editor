export default ({ app, error, redirect, route }) => {
  const token = app.$apolloHelpers.getToken()
  if (!token) {
    app.store.commit('auth/logout')
    return redirect(302, '/login?r=' + encodeURIComponent(route.path))
  } else {
    app.$axios.setToken(token, 'Bearer')
    app.store.dispatch('user/queryProfile')
    app.store.dispatch('user/queryPrivileges')
    app.store.commit('auth/login', token)
  }
}
