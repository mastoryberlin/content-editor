<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      fixed
      app
    >
      <v-treeview
        activatable
        :active="idFromRoute"
        selection-type="independent"
        color="warning"
        :items="stories"
        item-text="title"
        @update:active="navigate"
      >
        <template #prepend="{item, leaf}">
          {{ leaf ? `E${episodeIndex(item) + 1}: ` : null }}
        </template>
      </v-treeview>
    </v-navigation-drawer>
    <v-app-bar
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn
        color="green"
        elevation="3"
        :loading="isCommittingChanges"
        :disabled="isCommittingChanges"
        @click="commitChanges"
      >
        Save
      </v-btn>
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
import { mapState, mapActions } from 'vuex'
export default {
  computed: {
    ...mapState([
      'stories',
      'isCommittingChanges'
    ]),
    idFromRoute () {
      const p = this.$route.path
      if (p.startsWith('/element/')) {
        // Chop that beginning away to obtain the treeview item id
        return [p.substring(9)]
      } else {
        return []
      }
    }
  },
  data () {
    return {
      drawer: false,
      title: 'Mastory Content Editor'
    }
  },
  methods: {
    ...mapActions([
      'commitChanges'
    ]),
    navigate ([selected]) {
      this.$router.push(`/element/${selected}`)
    },
    episodeIndex (item) {
      const [storyId] = item.id.split('/')
      const story = this.$store.state.stories.find(s => s.id === storyId)
      if (story) {
        return story.children.indexOf(item)
      } else {
        return '?'
      }
    }
  }
}
</script>
