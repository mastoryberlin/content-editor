<template lang="html">
  <div class="">
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
        Are you sure students will not talk about this phase's context at all?
      </v-alert>

      <topic-section
        v-for="(topic, topicIndex) in phase.topics"
        :key="topic.id"
        :topic="topic"
        :number="topicIndex + 1"
      />
    </template>
  </div>
</template>

<script>
export default {
  props: {
    episode: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    allTopics: []
  }),
  apollo: {
    allTopics: {
      query: require('~/graphql/GetTopics'),
      update: data => data.topic
    }
  },
  computed: {
    phases () {
      if (!this.episode.sections) { return [] }
      return this.episode.sections.map((phase) => {
        const list = phase.topic_whitelist
        const topics = list.map((id) => {
          const top = this.allTopics.find(t => t.id === id)
          return top
        })
        return {
          ...phase,
          topics
        }
      })
    }
  }
}
</script>

<style lang="css" scoped>
</style>
