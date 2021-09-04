<template lang="html">
  <v-toolbar>
    <v-spacer />
    <v-btn
      elevation="7"
      :loading="loading"
      :disabled="loading"
      @click="onClick"
    >
      <v-icon color="green">
        mdi-check-bold
      </v-icon>
      {{ label }}
    </v-btn>
    <v-spacer />
  </v-toolbar>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: null
    },
    privileges: {
      type: Array,
      required: true
    },
    privilegeNeededToCommit: {
      type: String,
      required: true
    },
    finishWork: {
      type: String,
      default: ''
    }
  },
  emits: [
    'commit',
    'request-approvement'
  ],
  data: () => ({
    label: 'Mark work as finished'
  }),
  computed: {
    hasPrivilegeToCommit () {
      return this.privileges.includes(this.privilegeNeededToCommit)
    }
  },
  created () {
    if (this.hasPrivilegeToCommit) {
      this.label += ' ' + this.finishWork
    } else {
      this.label += ' and request approval'
    }
  },
  methods: {
    onClick () {
      if (this.privileges.includes(this.privilegeNeededToCommit)) {
        this.$emit('commit')
      } else {
        this.$emit('request-approvement')
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
