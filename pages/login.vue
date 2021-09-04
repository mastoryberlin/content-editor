<template lang="html">
  <div class="login-page">
    <div class="login-wrapper">
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
            @input="startEntering"
          />

          <v-text-field
            v-model="password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            :disabled="isRequestingLogin"
            label="Your password"
            @input="startEntering"
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

            <v-alert
              v-model="invalidCredentials"
              type="error"
              class="mt-8"
              transition="scale-transition"
              dismissible
            >
              Unknown credentials. Please try again
            </v-alert>
          </div>
        </v-form>
      </v-sheet>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  layout: 'public',
  data: () => ({
    userName: '',
    password: '',
    showPassword: false,
    invalidCredentials: false
  }),
  computed: {
    ...mapState('auth', [
      'loggedIn',
      'isRequestingLogin'
    ]),
    targetRoute () {
      const queryParam = this.$route.query.r
      if (queryParam) {
        return decodeURIComponent(queryParam)
      } else {
        return '/'
      }
    }
  },
  methods: {
    ...mapActions('auth', [
      'requestLogin'
    ]),
    async login () {
      await this.requestLogin([this.userName, this.password])
      if (this.loggedIn) {
        this.$router.replace(this.targetRoute)
      } else {
        this.invalidCredentials = true
      }
    },
    startEntering () {
      this.invalidCredentials = false
    }
  },
  mount () {
    if (this.loggedIn) {
      this.$router.replace(this.targetRoute)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
