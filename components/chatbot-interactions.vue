<template lang="html">
  <div class="">
    <template v-if="$apollo.loading">
      <v-skeleton-loader
        v-for="n in 5"
        :key="n"
        type="list-item"
      />
    </template>

    <template v-else-if="$apollo.error">
      An error occurred!
    </template>

    <template v-if="phases">
      <template v-for="(phase, phaseIndex) in phases">
        <div
          :key="phase.id + '-fixed'"
          class="my-7 pa-4 content-editor-specs-fixed"
        >
          <h2>#{{ phaseIndex + 1 }}: {{ phase.title }}</h2>
          <p>{{ phase.specs }}</p>
        </div>

        <v-alert v-if="phase.topics.length === 0" :key="phase.id + '-no-topics-alert'" type="warning" prominent>
          There are no topics selected in this phase.
          <a :style="{color: 'white', fontWeight: 'bold'}" @click.stop.prevent="$emit('goto-episode-specs')">Click here</a>
          to go back to the episode specs and edit the whitelist of topics for each phase.
        </v-alert>

        <v-expansion-panels :key="phase.id + '-topics'">
          <topic-section
            v-for="(topic, topicIndex) in phase.topics"
            :key="topic.id"
            :topic="topic"
            :number="topicIndex + 1"
          />
        </v-expansion-panels>
      </template>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    episode: {
      type: Object,
      required: true,
    },
  },
  emits: ['goto-episode-specs'],
  data: () => ({
    allTopics: [],
  }),
  apollo: {
    allTopics: {
      query: require('~/graphql/GetTopics'),
      update: data => data.topic,
      subscribeToMore: {
        document: require('~/graphql/RefreshTopics'),
        updateQuery: (previousResult, { subscriptionData }) => {
          const newResult = { ...previousResult }
          newResult.topic = JSON.parse(JSON.stringify(subscriptionData.data.topic))
          return newResult
        },
      },
    },
  },
  computed: {
    phases() {
      if (!this.episode.sections) { return [] }
      return this.episode.sections.map((phase) => {
        const list = phase.topic_whitelist
        const topics = list.map((id) => {
          const top = this.allTopics.find(t => t.id === id)
          return top
        })
        return {
          ...phase,
          topics,
        }
      })
    },
  },
}
</script>

<style lang="css" scoped>
</style>
