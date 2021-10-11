<template lang="html">
  <div class="">
    <v-select
      v-model="selectedAccount"
      label="Accounts"
      :items="accounts"
      item-text="first_name"
      item-value="id"
      return-object
    />
    <v-select
      v-model="selectedClass"
      label="Classes"
      :items="thisAccountsClasses"
      item-text="name"
      item-value="id"
      return-object
    />
    <v-btn @click="addAccount" v-text="'Add account'" />
    <v-btn :disabled="!selectedAccount" @click="addClass" v-text="'Add class'" />
    <v-btn :disabled="!selectedAccount" @click="$test.start(selectedClass)" v-text="'Start'" />
    <v-btn :disabled="!selectedAccount" @click="$test.reset(selectedClass)" v-text="'Reset'" />
    <v-btn :disabled="!selectedAccount" @click="$test.stop(selectedClass)" v-text="'Stop'" />
  </div>
</template>

<script>
export default {
  apollo: {
    accounts: {
      query: require('~/graphql/GetAccounts'),
      update: data => data.account,
    },
    classes: {
      query: require('~/graphql/GetClasses'),
      update: data => data.class,
    },
  },
  data: () => ({
    accounts: [],
    classes: [],
    selectedClass: null,
    selectedAccount: null,
  }),
  mount() {
    this.selectedClass = this.classes[0]
  },
  computed: {
    thisAccountsClasses() {
      const acc = this.selectedAccount
      if (acc) {
        return this.classes.filter(c => c.teacher_id === acc.id)
      } else {
        return []
      }
    },
  },
  methods: {
    async addAccount() {
      const name = prompt('Please enter here the name of the person associated with the new account:')
      if (name !== null) {
        const [firstName, lastName] = name.split(' ')
        const newAccount = await this.$apollo.mutate({
          mutation: require('~/graphql/AddAccount'),
          variables: { firstName, lastName },
        })
        this.accounts.push(newAccount)
      }
    },
    async addClass() {
      const { firstName, lastName, id } = this.selectedAccount
      const name = prompt('Please enter here the name of the new class.\nThis class will be associated with the selected account (' + firstName + ' ' + lastName + ')')
      if (name !== null) {
        const newClass = await this.$apollo.mutate({
          mutation: require('~/graphql/AddClass'),
          variables: { name, teacher_id: id },
        })
        this.accounts.push(newClass)
      }
    },
  },
}
</script>

<style lang="css" scoped>
</style>
