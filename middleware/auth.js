export default ({ app, error, redirect, route }) => {
  let token
  if (app) {
    token = app.$apolloHelpers.getToken()
  } else {
    token = null
  }
  console.log('$apolloHelpers.getToken()', token)
  if (!token) {
    return redirect('/login?r=' + encodeURIComponent(route.path))
  } else if (!app.store.state.user.profile) {
    app.store.dispatch('user/queryProfile')
    app.store.dispatch('user/queryPrivileges')
  }
}
