<template lang="html">
  <div>
    <h2>
      ({{ number }}) What might students say about “{{ topic.name }}”?
    </h2>
    <intent-card
      v-for="intent in intents"
      :key="intent.id"
      :intent="intent"
    />
  </div>
</template>

<script>
export default {
  props: {
    topic: {
      type: Object,
      required: true
    },
    number: {
      type: Number,
      required: true
    }
  },
  data: () => ({
    intentsRelatedToThisTopic: []
  }),
  apollo: {
    intentsRelatedToThisTopic () {
      return {
        query: require('~/graphql/GetIntentsForTopic.gql'),
        variables: {
          topicId: this.topic.id
        },
        update: data => data.intent
      }
    }
  },
  computed: {
    intents () {
      return this.intentsRelatedToThisTopic
    }
  }
}
</script>

<style lang="css" scoped>
</style>
