<template lang="html">
  <div class="">
    <h1>Choose a story to edit</h1>
    <apollo-query
      v-slot="{ result: { loading, error, data } }"
      :query="require('~/graphql/GetStories')"
    >
      <div v-if="loading">
        <v-skeleton-loader
          v-for="n in 5"
          :key="n"
          type="list-item"
        />
      </div>

      <div v-else-if="error">
        An error occurred!
      </div>

      <div v-else-if="data">
        <apollo-subscribe-to-more
          :document="require('~/graphql/RefreshStories')"
          :update-query="refreshStories"
        />
        <v-list>
          <v-list-item
            v-for="s in data.story.filter((s) => {
              const id = s.id
              return (privileges && privileges[id] && privileges[id].includes('view'))
            })"
            :key="s.id"
            @click="$router.push(`/element/${s.id}`)"
          >
            <v-list-item-content>
              <v-list-item-title v-text="s.title" />
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
    </apollo-query>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data: () => ({
  }),
  computed: {
    ...mapState('user', [
      'privileges'
    ])
  },
  methods: {
    refreshStories (previousResult, secondArg) {
      // if (previousResult && secondArg) {
      //   console.log(`Stories updated`, previousResult, secondArg)
      // const newResult = {
      //   story: [...previousResult.story]
      // }
      // newResult.story.push(subscriptionData.data.story)
      // return newResult
      // }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
