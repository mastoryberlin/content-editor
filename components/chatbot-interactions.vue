<template lang="html">
  <div class="">
    <template v-for="(phase, phaseIndex) in episode.sections">
      <div
        :key="phase.id + '-fixed'"
        class="my-7 pa-4 content-editor-specs-fixed"
      >
        <h2>#{{ phaseIndex + 1 }}: {{ phase.title }}</h2>
        <p>{{ phase.specs }}</p>
      </div>

      <template v-for="(topic, topicIndex) in phase.topic_whitelist">
        <h3 :key="topic.id">
          Topic {{ topicIndex +1 }}: “{{ topic.name }}”
        </h3>
      </template>
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
  apollo: {
    allTopics: {
      query: require('~/graphql/GetTopics'),
      update: data => data.topic
    }
  }
  // computed: {
  //   topics: (phase)
  // }
}
</script>

<style lang="css" scoped>
</style>
