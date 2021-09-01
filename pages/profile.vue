<template lang="html">
  <div class="">
    <h2>My Profile</h2>
    <v-alert v-if="!profile" type="error">
      There was a problem retrieving your profile. Please try to log out and log in again.
    </v-alert>
    <v-form v-else>
      <v-text-field
        label="Name"
        :value="profile.name"
      />
      <v-text-field
        label="Email address"
        :value="profile.email"
      />
      <v-text-field
        label="GitHub user name"
        :value="profile.gitName"
      />
      <v-text-field
        label="The email address used in GitHub"
        :value="profile.gitEmail"
      />
      <template v-if="showChangePasswordSection">
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
      </v-btn>
    </v-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data: () => ({
    showChangePasswordSection: false
  }),
  computed: {
    ...mapState('user', [
      'profile'
    ])
  }
}
</script>

<style lang="css" scoped>
</style>
