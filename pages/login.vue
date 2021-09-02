<template lang="html">
  <div class="">
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
          :disabled="isRequestingLogin()"
        />

        <v-text-field
          v-model="password"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          :disabled="isRequestingLogin()"
          label="Your password"
          @click:append="showPassword = !showPassword"
        />

        <div class="text-center">
          <v-btn
            :loading="isRequestingLogin()"
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
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  layout: 'public',
  data: () => ({
    userName: '',
    password: 'TOP SECRET',
    showPassword: false
  }),
  computed: {
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
    ...mapState('auth', [
      'loggedIn',
      'isRequestingLogin',
      'invalidCredentials'
    ]),
    ...mapActions('auth', [
      'requestLogin'
    ]),
    async login () {
      await this.requestLogin([this.userName, this.password])
      this.$router.replace(this.targetRoute)
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
