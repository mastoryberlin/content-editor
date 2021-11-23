<template>
  <div>
    <template v-if="$apollo.loading">
      <v-skeleton-loader v-for="n in 5" :key="n" type="list-item" />
    </template>

    <template v-else-if="$apollo.error">
      An error occured
    </template>

    <privileged-area v-else needs="edit_episode_intents" to="edit">
      <template v-if="surveys">
        <survey-card
          v-for="(survey, n) in surveys"
          :key="survey.id"
          :survey="survey"
          :number="n"
          @add-survey="addSurvey"
        />
        <div v-if="surveys.length === 0" class="d-flex">
          <v-spacer />
          <v-btn color="success" @click="addSurvey">
            <v-icon>mdi-plus</v-icon>Create a survey
          </v-btn>
          <v-spacer />
        </div>
      </template>
    </privileged-area>
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
      return this.$route.params.episode
    },
  },
  methods: {
    addSurvey() {
      this.$db.add({ survey: true }, 'episode', null, {}, this.episodeId)
    },
  },
}
</script>

<style lang="css" scoped>
</style>
