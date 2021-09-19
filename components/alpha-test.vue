<template lang="html">
  <div class="">
    <v-select v-model="selectedClass" :items="classes" item-text="name" item-value="id" return-object />
    <v-btn @click="$test.start(selectedClass)" v-text="'Start'" />
    <v-btn @click="$test.reset(selectedClass)" v-text="'Reset'" />
    <v-btn @click="$test.stop(selectedClass)" v-text="'Stop'" />
  </div>
</template>

<script>
export default {
  apollo: {
    classes: {
      query: require('~/graphql/GetClasses'),
      update: data => data.class,
    },
  },
  data: () => ({
    classes: [],
    selectedClass: null,
  }),
  mount() {
    this.selectedClass = this.classes[0]
  },
}
</script>

<style lang="css" scoped>
</style>
