<template>
  <v-app>
    <apollo-query
      v-slot="{ result: { loading, error, data } }"
      :query="require('~/graphql/GetStories')"
    >
      <v-navigation-drawer v-model="drawer" fixed app>
        <div v-if="loading">
          <v-skeleton-loader v-for="n in 5" :key="n" type="list-item" />
        </div>

        <div v-else-if="error">
          An error occurred!
        </div>

        <div v-else-if="data">
          <apollo-subscribe-to-more
            :document="require('~/graphql/RefreshStories')"
            :update-query="refreshStories"
          />

          <v-treeview
            activatable
            :active="idFromRoute"
            active-class="font-weight-bold blue lighten-4"
            selection-type="independent"
            class="nav"
            color="black"
            :items="
              data.story.filter((s) => {
                const id = s.id;
                return (
                  privileges &&
                  (privileges['superadmin'] ||
                    (privileges[id] && privileges[id].includes('view')))
                );
              })
            "
            :open="[storyIdFromRoute]"
            item-text="title"
            item-children="chapters"
            hoverable
            @update:active="navigate($event, data.story)"
          >
            <template #prepend="{ item }">
              {{
                item.story ? `E${episodeIndex(item, data.story) + 1}: ` : null
              }}
            </template>
          </v-treeview>
        </div>
        <v-btn block @click="addStory">
          Add Story
        </v-btn>
      </v-navigation-drawer>
      <v-app-bar fixed app>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
        <v-toolbar-title>
          Mastory Content Editor
          <span class="mx-4 text-subtitle-2" v-text="version" />
        </v-toolbar-title>

        <v-spacer />

        <template v-if="storyIdFromRoute">
          <template v-for="(state, i) in globalState.names">
            <v-icon v-if="i > 0" :key="'arrow' + i" class="mx-1">
              mdi-arrow-right
            </v-icon>

            <v-tooltip :key="'tooltip' + i" bottom>
              <template #activator="{ on, attrs }">
                <v-avatar
                  :key="'avatar' + i"
                  class="content-editor-global-state-indicator"
                  :color="
                    data && isGlobalState(state, data.story)
                      ? globalState.color[i]
                      : '#dddddd'
                  "
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon
                    :key="'icon' + i"
                    :color="
                      data && isGlobalState(state, data.story) ? 'black' : null
                    "
                  >
                    mdi-{{ globalState.icons[i] }}
                  </v-icon>
                </v-avatar>
              </template>
              <span>Step {{ i + 1 }}: Edit {{ globalState.tooltip[i] }}</span>
            </v-tooltip>
          </template>
        </template>

        <v-spacer />

        <v-toolbar-title>
          <small v-text="statusText" />
        </v-toolbar-title>

        <v-spacer />

        <div class="text-center">
          <v-menu offset-y>
            <template #activator="{ on, attrs }">
              <v-avatar
                color="indigo"
                size="48"
                class="mx-3"
                v-bind="attrs"
                v-on="on"
              >
                <span
                  class="white--text text-h6"
                  v-text="loggedIn ? initials : '?'"
                />
              </v-avatar>
            </template>
            <v-list>
              <v-list-item
                v-if="Object.keys(privileges).includes('superadmin')"
                @click="$router.push('/accounts')"
              >
                <v-list-item-title>Manage accounts</v-list-item-title>
              </v-list-item>
              <v-list-item
                v-for="(item, index) in menu"
                :key="index"
                @click="item.action"
              >
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </v-app-bar>
      <v-main>
        <v-container>
          <nuxt />
        </v-container>
      </v-main>
      <v-footer app>
        <span>&copy; {{ new Date().getFullYear() }} Mastory</span>
      </v-footer>
    </apollo-query>
  </v-app>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  middleware: 'auth',
  data() {
    return {
      drawer: false,
      menu: [
        {
          title: 'Edit my profile',
          action: this.editProfile,
        },
        {
          title: 'Report an issue or make a suggestion for content editor',
          action: this.gotoIssuesPage,
        },
        {
          title: 'Log out',
          action: this.logout,
        },
      ],
      globalState: {
        names: ['specs', 'episodes', 'details'],
        icons: ['script-text', 'format-list-numbered', 'creation'],
        color: ['warning lighten-2', 'blue lighten-3', 'purple lighten-2'],
        tooltip: ['story specs', 'episode specs', 'episode details'],
      },
    }
  },
  computed: {
    ...mapState([
      'stories',
      'isCommittingChanges',
    ]),
    ...mapState('auth', [
      'isRequestingLogin',
      'loggedIn',
      'invalidCredentials',
    ]),
    ...mapState('user', [
      'privileges',
    ]),
    ...mapGetters('user', [
      'initials',
    ]),
    ...mapGetters('autosave', [
      'statusText',
    ]),
    idFromRoute() {
      const p = this.$route.path
      if (p.startsWith('/element/')) {
        // Last uuid is the treeview item id
        return [p.substr(p.lastIndexOf('/') + 1)]
      } else {
        return []
      }
    },
    storyIdFromRoute() {
      const p = this.$route.path
      if (p.startsWith('/element/')) {
        // Last uuid is the treeview item id
        const nextSlash = p.indexOf('/', 9)
        return nextSlash >= 0 ? p.substr(9, nextSlash - 9) : p.substr(9)
      } else {
        return null
      }
    },
    isStorySelected() {
      const storyPattern = /^\/element\/[-0-9a-f]+$/
      return storyPattern.test(this.$route.path)
    },
    isEpisodeSelected() {
      const episodePattern = /^\/element\/[-0-9a-f]+\/[-0-9a-f]+$/
      return episodePattern.test(this.$route.path)
    },
    version() {
      const packageJSON = require('~/package.json')
      const version = packageJSON.version
      return 'v' + version
    },
  },
  methods: {
    ...mapActions([
      'commitChanges',
    ]),
    ...mapActions('auth', [
      'requestLogin',
      'requestLogout',
    ]),
    refreshStories(previousResult, { subscriptionData }) {
      console.log('refreshStories', { previousResult, subscriptionData })
      const newQueryResult = subscriptionData.data.story
      const newStories = {
        story: [
          ...newQueryResult,
        ],
      }
      newStories.story.forEach((s, i) => {
        s.chapters = [...newQueryResult[i].chapters]
      })
      return newStories
    },
    addStory() {
      const variables = { title: 'New Story', description: 'New Story Description' }
      this.$db.add({ story: { episode: { phase: { message: true } } } }, null, null, variables, null)
    },
    navigate([selected], stories) {
      const isStory = stories.find(s => s.id === selected)
      if (isStory) {
        this.$router.push('/element/' + selected)
      } else {
        stories.forEach((s) => {
          if (s.chapters.find(c => c.id === selected)) {
            this.$router.push('/element/' + s.id + '/' + selected)
          }
        })
      }
    },
    episodeIndex(episode, stories) {
      const storyId = episode.story.id
      const story = stories.find(s => s.id === storyId)
      return story ? story.chapters.indexOf(episode) : '?'
    },
    login() {
      this.requestLogin([this.userName, this.password])
      this.userName = ''
      this.password = ''
      this.showPassword = false
    },
    logout() {
      this.requestLogout()
      this.$router.replace('/login?r=' + encodeURIComponent(this.$route.path))
    },
    editProfile() {
      this.$router.push('/profile')
    },
    gotoIssuesPage() {
      window.open('https://github.com/mastoryberlin/content-editor/issues', '_blank')
    },
    selectedStory(stories) {
      return stories.find(s => s.id === this.storyIdFromRoute)
    },
    selectedEpisode(stories) {
      const story = this.selectedStory(stories)
      return story.chapters.find(e => e.id === this.idFromRoute[0])
    },
    isGlobalState(state, data) {
      switch (state) {
        case 'specs':
          return this.isStorySelected && this.selectedStory(data).edit.state === state
        case 'episodes':
          return (this.isStorySelected && this.selectedStory(data).edit.state === state) ||
          (this.isEpisodeSelected && this.selectedEpisode(data).edit.state === 'specs')
        case 'details':
          return this.isEpisodeSelected && this.selectedEpisode(data).edit.state === state
        default:
          return false
      }
    },
  },
}
</script>

<style lang="sass">
video
  width: 33%
.v-treeview-node
  cursor: pointer
.content-editor
  padding: 5px
  &-global-state-indicator
    transition: 1s ease-in-out
  &-draggable
    position: relative
    &-sidebar
      display: inline-block
      margin-right: 5px
      max-width: 20px
      cursor: all-scroll
    &-content
      display: inline-block
    &-title
      display: inline-block
    &-specs
      display: inline-block
      width: 100%
    &-meta
      display: inline-block
      max-width: 20em
    &-add
      position: absolute
      bottom: -24px
      right: 24px
      &-menu
        position: absolute
        bottom: -16px
        right: 96px
    &-logic
      font-style: italic
    &-text-message
      &-bg
        background-color: #e6e6ff !important
    &-image-message
      &-bg
        background-color: #fff5e1 !important
    &-audio-message
      &-bg
        background-color: #efffef !important
    &-video-message
      &-bg
        background-color: #fee !important
    &-nestable-message
      &-bg
        background-color: #fff0ff !important
  &-specs
    &-fixed
      background: orange
  &-prompts
    display: inline
    &-buttons
      text-align: center
  &-interactions
    &-npc
      display: inline
  &-worksheet
    &-html
      background: #2d2d2d
      color: #ccc
      font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace
      font-size: 11pt
      line-height: 1.5em
      padding: 5px
.v-overlay__content
  text-align: center
  & > p
    font-size: x-large
  & a
    color: lightgray
    transition: 0.2s ease-in
  & a:hover
    color: #ffc24b
    transition: 0.5s ease-out
</style>
