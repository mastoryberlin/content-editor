<template lang="html">
  <div class="">
    <h2>My Profile</h2>
    <v-alert v-if="!profile" type="error">
      There was a problem retrieving your profile. Please try to log out and log in again.
    </v-alert>
    <v-form v-else @submit.prevent="save">
      <v-text-field
        v-model="name"
        label="Name"
      />
      <v-text-field
        v-model="email"
        label="Email address"
      />
      <v-text-field
        v-model="gitName"
        label="GitHub user name"
      />
      <v-text-field
        v-model="gitEmail"
        label="The email address used in GitHub"
      />
      <template v-if="showChangePasswordSection">
        <v-text-field
          v-model="password"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          label="New password"
          :rules="[password !== '' || 'This field may not be left empty']"
          @click:append="showPassword = !showPassword"
        />
        <v-text-field
          v-model="passwordRepeated"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          label="Enter new password again"
          :rules="[passwordRepeated === password || 'This field must match the password you entered above']"
          @click:append="showPassword = !showPassword"
        />
        <v-btn
          :disabled="password === '' || password !== passwordRepeated"
          @click="changePassword"
        >
          Change it!
        </v-btn>
      </template>
      <v-btn v-else @click="showChangePasswordSection = true">
        Change Password
      </v-btn>
      <v-btn type="submit">
        Save changes
      </v-btn>
    </v-form>
    <v-alert v-if="showPasswordChangedHint" type="success" dismissible>
      Password changed
    </v-alert>
    <v-alert v-if="showSavedHint" type="success" dismissible>
      Profile updated
    </v-alert>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  asyncData({ store }) {
    let name, email, gitName, gitEmail
    const p = store.state.user.profile
    if (p) {
      name = p.name
      email = p.email
      gitName = p.gitName
      gitEmail = p.gitEmail
    } else {
      name = ''
      email = ''
      gitName = ''
      gitEmail = ''
    }
    return { name, email, gitName, gitEmail }
  },
  data: () => ({
    showChangePasswordSection: false,
    password: '',
    passwordRepeated: '',
    showPasswordChangedHint: false,
    showSavedHint: false,
    showPassword: false,
  }),
  computed: {
    ...mapState('user', [
      'profile',
    ]),
  },
  methods: {
    async changePassword() {
      try {
        const resp = await this.$axios.$post('https://proc.mastory.io/content-editor/user/password', {
          password: this.password,
        })
        if (resp.success) {
          this.password = ''
          this.passwordRepeated = ''
          this.showPassword = false
          this.showChangePasswordSection = false
          this.showPasswordChangedHint = true
        }
      } catch (err) {}
    },
    async save() {
      try {
        const resp = await this.$axios.$post('https://proc.mastory.io/content-editor/user/profile', {
          id: this.$store.state.user.profile.id,
          name: this.name,
          email: this.email,
          gitName: this.gitName,
          gitEmail: this.gitEmail,
        })
        if (resp.success) {
          this.showSavedHint = true
        }
      } catch (err) {}
    },
  },
}
</script>

<style lang="css" scoped>
</style>
