<template lang="html">
  <div>
    <div v-if="$apollo.loading">
      <v-skeleton-loader
        v-for="n in 5"
        :key="n"
        type="list-item"
      />
    </div>

    <div v-else-if="$apollo.error">
      An error occurred!
    </div>

    <div v-else>
      <apollo-subscribe-to-more
        :document="require('~/graphql/RefreshTopics')"
        :update-query="refreshAllTopics"
      />
      <p>Topics Whitelist:</p>
      <v-combobox
        v-model="topics"
        :filter="filter"
        :hide-no-data="!search"
        :items="allTopics"
        item-text="name"
        :search-input.sync="search"
        hide-selected
        multiple
        small-chips
        @change="editTopics"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    phase: {
      type: Object,
      required: true
    }
  },
  apollo: {
    allTopics: {
      query: require('~/graphql/GetTopics'),
      update: data => data.topic
    }
  },
  data: () => ({
    allTopics: [],
    topics: [],
    search: null
  }),
  computed: {
  },

  methods: {
    refreshAllTopics (previousResult, { subscriptionData }) {
      console.log('refreshAllTopics', previousResult, subscriptionData)
      const newResult = { ...previousResult }
      // if (previousResult && subscriptionData) {
      //   if (previousResult.length < subscriptionData.)
      // }
      // else {
      // }
      return newResult
    },
    filter (item, queryText, itemText) {
      if (item.header) { return false }

      const hasValue = val => val != null ? val : ''

      const text = hasValue(itemText)
      const query = hasValue(queryText)

      return text.toString()
        .toLowerCase()
        .includes(query.toString().toLowerCase())
    },
    editTopics (value) {
      console.log('BEGIN editTopics ', this.topics)
      this.topics = this.topics.map((v) => {
        if (typeof v === 'string') {
          this.$apollo.mutate({
            mutation: require('~/graphql/AddTopic'),
            variables: { name: v }
          })
            .then(({ data: { insert_topic_one: { id } } }) => {
              const newTopic = this.topics.find(t => t.name === v.name)
              if (newTopic) {
                newTopic.id = id
                console.log('UPDATED newTopic ', this.topics)
              } else {
                console.log('FAILED to update newTopic - couldn\'t find the name ' + v.name)
              }
            })
          v = {
            name: v
          }
        }
        return v
      })
      console.log('END editTopics ', this.topics)
    }
  }
}
</script>

<style lang="css" scoped />
