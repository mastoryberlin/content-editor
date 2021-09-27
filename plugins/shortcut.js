import Shortcut from 'clubhouse-lib'

export default (context, inject) => {
  inject('shortcut', Shortcut.create(process.env.NUXT_ENV_SHORTCUT_API_TOKEN))
}
