<template lang="html">
  <div class="">
    <template v-if="$apollo.loading">
      Loading...
    </template>

    <template v-if="surveys">
      <survey-card
        v-for="(survey, n) in surveys"
        :key="survey.id"
        :survey="survey"
        :number="n"
        @add-survey="addSurvey"
      />
      <span v-if="surveys.length === 0" @click="addSurvey">
        Click here to add a survey for this episode.
      </span>
    </template>

    <template v-else>
      An error occured
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
  apollo: {
    surveys: {
      query: require('~/graphql/GetSurveys'),
      variables() {
        return { episodeId: this.episodeId }
      },
      update: data => data.survey,
      subscribeToMore: {
        document: require('~/graphql/RefreshSurveys'),
        variables() {
          return { episodeId: this.episodeId }
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          const newResult = { ...previousResult }
          newResult.survey = JSON.parse(JSON.stringify(subscriptionData.data.survey))
          return newResult
        },
      },
    },
  },
  data: () => ({
  }),
  computed: {
    episodeId() {
      return this.episode.id
    },
  },
  methods: {
    addSurvey() {
      this.$apollo.mutate({
        mutation: require('~/graphql/AddSurvey'),
        variables: {
          episodeId: this.episodeId,
        },
      })
    },
  },
}
</script>

<style lang="css" scoped>
</style>
