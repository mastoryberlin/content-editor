<template>
  <div class="">
    <template v-if="$apollo.loading">
      <v-skeleton-loader v-for="n in 5" :key="n" type="list-item" />
    </template>
    <template v-else-if="$apollo.error">An error occured</template>
    <privileged-area v-else needs="edit_episode_math" to="edit">
      <template v-if="challenge">
        <worksheet-card
          v-for="(worksheet, n) in worksheets"
          :key="worksheet.id"
          :worksheet="worksheet"
          @add-worksheet="addWorksheet(n + 2)"
        />
        <span v-if="worksheets.length === 0" @click="addWorksheet(1)">
          Click here to add a worksheet for this episode’s math challenge.
        </span>
      </template>

      <span v-else @click="addChallenge">
        Click here to add a math challenge for this episode.
      </span>
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
    challenge: {
      query: require('~/graphql/GetChallenge'),
      variables() {
        return { episodeId: this.episodeId }
      },
      update: data => data.challenge.length > 0 ? data.challenge[0] : null,
      subscribeToMore: {
        document: require('~/graphql/RefreshChallenge'),
        variables() {
          return { episodeId: this.episodeId }
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          const newResult = { ...previousResult }
          newResult.challenge = JSON.parse(JSON.stringify(subscriptionData.data.challenge))
          return newResult
        },
      },
    },
  },
  data: () => ({
    challenge: null,
  }),
  computed: {
    episodeId() {
      return this.$route.params.episode
    },
    worksheets() {
      return this.challenge.geogebra_worksheets
    },
  },
  methods: {
    addChallenge() {
      const variables = {
        episodeId: this.episodeId,
      }
      this.$db.add('challenge', null, variables, null)
    },
    addWorksheet(number = 1) {
      const variables = {
        challengeId: this.challenge.id,
        number,
      }
      this.$db.add('worksheet', null, variables, null)
    },
  },
}
</script>

<style lang="css" scoped>
</style>
