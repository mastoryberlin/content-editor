<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(chapter, i) in chapters"
          :key="i"
          :to="'/chapter/' + chapter.id"
          router
          exact
        >
          <v-list-item-content>
            <v-list-item-title v-text="chapter.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-footer
      app
    >
      <span>&copy; {{ new Date().getFullYear() }} Mastory</span>
    </v-footer>
  </v-app>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['chapters'])
  },
  data () {
    return {
      drawer: false,
      title: 'The Cloud Content Editor'
    }
  }
}
</script>
