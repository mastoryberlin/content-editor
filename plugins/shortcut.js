import Clubhouse from 'clubhouse-lib'

export default (context, inject) => {
  inject('shortcut', Clubhouse.create(process.env.NUXT_ENV_SHORTCUT_API_TOKEN))
}
