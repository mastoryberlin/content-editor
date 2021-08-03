<template lang="html">
  <div class="">
    <h1>Choose a story to edit</h1>
    <v-list>
      <v-list-item
        v-for="s in stories"
        :key="s.id"
        @click="$router.push(`/element/${s.id}`)"
      >
        <v-list-item-content>
          <v-list-item-title v-text="s.title" />
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: mapState([
    'stories'
  ])
}
</script>

<style lang="css" scoped>
</style>
