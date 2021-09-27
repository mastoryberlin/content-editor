<template lang="html">
  <div class="">
    <h2>User Accounts</h2>
    <v-select v-model="account" :items="userAccounts" />
    <template
      v-if="account"
      class=""
    >
      <!-- <v-switch
        :value="superAdmin"
        :disabled="account === login"
        :label="'This user is ' + (superAdmin ? '' : 'not ') + 'a super admin'"
        @click="toggleSuperAdmin"
      /> -->
      <v-simple-table>
        <thead>
          <tr>
            <th class="text-left">
              Course
            </th>
            <th class="text-left">
              Role
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="story in stories"
            :key="story.id"
          >
            <td>{{ story.title }}</td>
            <td>
              <v-select
                :value="roles[story.id]"
                :items="allRoles"
                @change="switchRole(story.id, $event)"
              />
            </td>
          </tr>
        </tbody>
      </v-simple-table>
      <v-btn color="red" @click="deleteUser">
        Delete user
      </v-btn>
    </template>
    <v-btn @click="addUser">
      Add user
    </v-btn>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  apollo: {
    stories: {
      query: require('~/graphql/GetStories'),
      update: data => data.story,
    },
  },
  async asyncData({ $axios }) {
    const response = await $axios.$get('https://proc.mastory.io/content-editor/user/roles')
    const userRoles = response.success ? response.userRoles : null
    return { userRoles }
  },
  data: () => ({
    account: null,
    allRoles: [
      'admin',
      'contributor:screenwriter',
      'contributor:math-author',
      'contributor:ux-researcher',
      'contributor:head-of-content',
      'observer',
      '(no access)',
    ],
  }),
  computed: {
    ...mapGetters('user', [
      'login',
    ]),
    userAccounts() {
      if (this.userRoles) {
        return this.userRoles.map(ur => ur.id).sort()
      } else {
        return []
      }
    },
    roles: {
      get() {
        if (this.userRoles && this.account) {
          const rolesObject = this.userRoles.find(ur => ur.id === this.account)
          if (rolesObject) {
            return rolesObject.roles
          } else { return [] }
        } else { return [] }
      },
      set(v) {
        const rolesObject = this.userRoles.find(ur => ur.id === this.account)
        if (rolesObject) {
          rolesObject.roles = v
        }
      },
    },
    superAdmin() {
      return this.roles
        ? Object.keys(this.roles).includes('superadmin')
        : false
    },
  },
  methods: {
    toggleSuperAdmin(isSuperAdmin) {
      const newRoles = { ...this.roles }
      let question
      if (isSuperAdmin) {
        question = 'Are you sure you want to make "' + this.account + '" a super admin?'
        newRoles.superadmin = 'admin'
      } else {
        question = 'Are you sure you want to change "' + this.account + '"\'s role to not being a super admin anymore?'
        delete newRoles.superadmin
      }
      if (confirm(question)) {
        this.$axios.post('https://proc.mastory.io/content-editor/user/roles', {
          userName: this.account,
          roles: newRoles,
        })
        this.roles = newRoles
      }
    },
    switchRole(story, newRole) {
      const newRoles = { ...this.roles }
      if (newRole === '(no access)') {
        delete newRole[story]
      } else {
        newRoles[story] = newRole
      }
      this.$axios.post('https://proc.mastory.io/content-editor/user/roles', {
        userName: this.account,
        roles: newRoles,
      })
      this.roles = newRoles
    },
    addUser() {
      const newUserName = prompt('Please enter a login name for the new user!')
      if (newUserName) {
        this.userRoles.push({ id: newUserName, roles: {} })
        this.$axios.post('https://proc.mastory.io/content-editor/user', {
          userName: newUserName,
          initialPassword: 'TOP SECRET',
        })
      }
    },
    deleteUser() {
      this.$axios.delete('https://proc.mastory.io/content-editor/user', {
        params: {
          user: this.account,
        },
      })
    },
  },
}
</script>

<style lang="css" scoped>
</style>
