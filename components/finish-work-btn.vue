<template lang="html">
  <v-toolbar>
    <v-spacer />
    <v-btn
      elevation="7"
      :loading="loading"
      :disabled="loading"
      @click="$emit('click')"
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
    label: {
      type: String,
      default: 'Mark as finished'
    },
    loading: {
      type: Boolean,
      default: null
    }
  },
  emits: ['click']
}
</script>

<style lang="css" scoped>
</style>
