<template>
  <v-app>
    <template v-if="loggedIn">
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
          item-children="episodes"
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
        <v-avatar
          color="indigo"
          size="48"
          class="mx-3"
          @click="logout"
        >
          <span
            class="white--text text-h6"
            v-text="loggedIn ? initials : '?'"
          />
        </v-avatar>
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
    </template>

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
        <v-form>
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
              @click="login"
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
      title: 'Mastory Content Editor',
      userName: '',
      password: '',
      showPassword: false
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
    ...mapGetters('auth', [
      'initials'
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
    navigate ([selected]) {
      this.$router.push(`/element/${selected}`)
    },
    episodeIndex (item) {
      const [storyId] = item.id.split('/')
      const story = this.$store.state.stories.find(s => s.id === storyId)
      if (story) {
        return story.episodes.indexOf(item)
      } else {
        return '?'
      }
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
