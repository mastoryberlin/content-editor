<template lang="html">
  <div class="">
    <h2>My Profile</h2>
    <v-alert v-if="!profile" type="error">
      There was a problem retrieving your profile. Please try to log out and log in again.
    </v-alert>
    <v-form v-else @submit="save">
      <v-text-field
        label="Name"
        :value="name"
      />
      <v-text-field
        label="Email address"
        :value="email"
      />
      <v-text-field
        label="GitHub user name"
        :value="gitName"
      />
      <v-text-field
        label="The email address used in GitHub"
        :value="gitEmail"
      />
      <v-btn type="submit">
        Save changes
      </v-btn>
      <!-- <template v-if="showChangePasswordSection">
        <v-text-field
          label="Old password"
        />
        <v-text-field
          label="New password"
        />
        <v-text-field
          label="Enter new password again"
        />
        <v-btn>Apply</v-btn>
      </template>
      <v-btn v-else @click="showChangePasswordSection = true">
        Change Password
      </v-btn> -->
    </v-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  asyncData ({ store }) {
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
    showChangePasswordSection: false
  }),
  computed: {
    ...mapState('user', [
      'profile'
    ])
  },
  methods: {
    save () {
      console.log('New profile data: ', this.name, this.email, this.gitName, this.gitEmail)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
