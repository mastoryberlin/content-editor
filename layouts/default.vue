<template>
  <v-app>
    <apollo-query
      v-if="loggedIn"
      v-slot="{ result: { loading, error, data } }"
      :query="require('~/graphql/GetStories')"
    >
      <v-navigation-drawer
        v-model="drawer"
        fixed
        app
      >
        <div v-if="loading">
          <v-skeleton-loader
            v-for="n in 5"
            :key="n"
            type="list-item"
          />
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
            selection-type="independent"
            color="warning"
            :items="data.story"
            item-text="title"
            item-children="chapters"
            @update:active="navigate($event, data.story)"
          >
            <template #prepend="{item}">
              {{ item.story ? `E${episodeIndex(item, data.story) + 1}: ` : null }}
            </template>
          </v-treeview>
        </div>
      </v-navigation-drawer>
      <v-app-bar
        fixed
        app
      >
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
        <v-toolbar-title>
          Mastory Content Editor
        </v-toolbar-title>
        <v-spacer />
        <v-toolbar-title>
          <small v-text="statusText" />
        </v-toolbar-title>

        <v-spacer />

        <template>
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
                  v-for="(item, index) in items"
                  :key="index"
                  @click="item.action"
                >
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>

        <v-btn
          color="green"
          elevation="3"
          :loading="isCommittingChanges"
          :disabled="isCommittingChanges"
          @click="commitChanges"
        >
          Commit
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
    </apollo-query>

    <template
      v-else
    >
      <v-alert
        v-if="invalidCredentials"
        type="error"
        dismissible
        class="mt-8 login-failed-message"
        transition="scale-transition"
      >
        Unknown credentials. Please try again
      </v-alert>

      <v-sheet
        class="login-sheet"
        elevation="5"
      >
        <v-form
          @submit.prevent="login"
        >
          <h2>Log in</h2>
          <v-text-field
            v-model="userName"
            label="Your user name"
            :disabled="isRequestingLogin"
          />
          <v-text-field
            v-model="password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            :disabled="isRequestingLogin"
            label="Your password"
            @click:append="showPassword = !showPassword"
          />
          <div class="text-center">
            <v-btn
              :loading="isRequestingLogin"
              :disabled="userName === '' || password === ''"
              type="submit"
            >
              Log in!
              <template #loader>
                <v-progress-circular
                  :width="3"
                  :size="25"
                  indeterminate
                  color="primary"
                />
              </template>
              <style scoped>
                .v-progress-circular {
                margin: 1rem;
                }
              </style>
            </v-btn>
          </div>
        </v-form>
      </v-sheet>
    </template>
  </v-app>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  data () {
    return {
      drawer: false,
      userName: '',
      password: 'TOP SECRET',
      showPassword: false,
      items: [
        {
          title: 'Log out',
          action: this.logout
        }
      ]
    }
  },
  computed: {
    ...mapState([
      'stories',
      'isCommittingChanges'
    ]),
    ...mapState('auth', [
      'isRequestingLogin',
      'loggedIn',
      'invalidCredentials'
    ]),
    ...mapGetters('autosave', [
      'statusText'
    ]),
    ...mapGetters('auth', [
      'initials'
    ]),
    idFromRoute () {
      const p = this.$route.path
      if (p.startsWith('/element/')) {
        // Last uuid is the treeview item id
        return [p.substr(p.lastIndexOf('/') + 1)]
      } else {
        return []
      }
    }
  },
  methods: {
    ...mapActions([
      'commitChanges'
    ]),
    ...mapActions('auth', [
      'requestLogin',
      'requestLogout'
    ]),
    ...mapMutations('auth', [
    ]),
    refreshStories (previousResult, { subscriptionData }) {
      console.log('refreshStories', { previousResult, subscriptionData })
      const newQueryResult = subscriptionData.data.story
      const newStories = {
        story: [
          ...newQueryResult
        ]
      }
      newStories.story.forEach((s, i) => {
        s.chapters = [...newQueryResult[i].chapters]
      })
      return newStories
    },
    navigate ([selected], stories) {
      const isStory = stories.find(s => s.id === selected)
      if (isStory) {
        this.$router.push(`/element/${selected}`)
      } else {
        stories.forEach(s => {
          if (s.chapters.find(c => c.id === selected)) {
            this.$router.push(`/element/${s.id}/${selected}`)
          }
        })
      }
    },
    episodeIndex (episode, stories) {
      const storyId = episode.story.id
      const story = stories.find(s => s.id === storyId)
      return story ? story.chapters.indexOf(episode) : '?'
    },
    login () {
      this.requestLogin([this.userName, this.password])
      this.userName = ''
      this.password = ''
      this.showPassword = false
    },
    logout () {
      this.requestLogout()
    }
  }
}
</script>

<style lang="sass">
.content-editor
  padding: 5px
  &-draggable
    position: relative
    &-sidebar
      display: inline-block
      margin-right: 5px
      max-width: 20px
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
    &-logic
      font-style: italic
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
.login
  &-sheet
    max-width: 400px
    margin: auto auto
    padding: 2em
  &-failed-message
    position: fixed
</style>
