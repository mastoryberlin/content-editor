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
            v-for="s in data.story"
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
/* eslint-disable */
export default {
  methods: {
    refreshStories () {
      console.log(`Stories updated`) // previousResult, { subscriptionData } : previous: ${JSON.stringify(previousResult)}, subscriptionData: ${JSON.stringify(subscriptionData)}
      // const newResult = {
      //   story: [...previousResult.story]
      // }
      // // Add the question to the list
      // newResult.story.push(subscriptionData.data.story)
      // return newResult
    }
  }
}
</script>

<style lang="css" scoped>
</style>
