import colors from 'vuetify/es5/util/colors'

export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - Mastory Content Editor',
    title: 'Story Selection',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  server: {
    port: 5000
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/readstat.js',
    '~/plugins/extensions.js',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/apollo'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    host: process.env.BACKEND === 'local'
    ? 'localhost'
    : `${process.env.NODE_ENV === 'development' ? 'dev-proc' : 'proc'}.mastory.io`,
    port: process.env.BACKEND === 'local' ? 4000 : 443,
    prefix: '/content-editor/',
    https: process.env.BACKEND !== 'local',
  },

  apollo: {
     clientConfigs: {
       default: '~/apollo.config.js'
     }
   },

  eslint: {
    fix: true
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    // babel: {
    //   presets({isServer}) {
    //     const targets = isServer ? { node: 'current' } : { ie: 11 }
    //     return [
    //       [ require.resolve("@babel/preset-env"), { targets }  ]
    //     ]
    //   },
    //   plugins: [
    //     ["@babel/plugin-proposal-private-property-in-object", { "loose": true }],
      //   "@babel/syntax-dynamic-import",
      //   "@babel/transform-runtime",
      //   "@babel/transform-async-to-generator"
    //   ]
    // },
  }
}
