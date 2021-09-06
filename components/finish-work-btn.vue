<template lang="html">
  <v-toolbar>
    <v-spacer />
    <v-btn
      elevation="7"
      :loading="loading"
      :disabled="loading"
      @click="$emit('click', $event)"
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
  emits: ['click'],
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
  }
}
</script>

<style lang="css" scoped>
</style>
