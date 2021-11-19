export default ({ app: { store }, route, query, redirect }) => {
  const tab = query.t
  const { path } = route
  if (tab) {
    store.commit('storeTab', { path, tab })
  } else {
    const t = store.state.visitedTabs[path]
    if (t) { redirect(path, { t }) }
  }
}
