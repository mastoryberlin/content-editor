<template lang="html">
  <div class="">
    <h1>Choose a chapter you want to edit</h1>
    <v-list>
      <v-list-item
        v-for="c in chapters"
        :key="c.id"
        @click="$router.push(`/chapter/${c.id}`)"
      >
        <v-list-item-content>
          <v-list-item-title v-text="c.title" />
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: mapState([
    'chapters'
  ])
}
</script>

<style lang="css" scoped>
</style>
