<template>
  <div>
    <template v-if="$apollo.loading">
      <v-skeleton-loader v-for="n in 5" :key="n" type="list-item" />
    </template>

    <template v-else-if="$apollo.error">
      An error occurred!
    </template>

    <privileged-area v-else needs="edit_episode_narrative" to="edit">
      <template v-if="data">
        <lazy-phase-block v-for="phase in data" :key="phase.id" :phase-id="phase.id" :disabled="editingProhibited" />

        <div class="d-flex flex-row justify-space-between ma-5">
          <finish-work-btn tab-type="message-flow" button-type="commit" />
          <finish-work-btn tab-type="message-flow" button-type="issue-pr" />
        </div>
      </template>
    </privileged-area>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  // props: {
  //   episode: {
  //     type: Object,
  //     required: true,
  //   },
  // },
  apollo: {
    phases: {
      query: require('~/graphql/GetEpisodePhases'),
      variables() {
        return { id: this.episodeId }
      },
      update: data => data.story_chapter_by_pk.sections,
      subscribeToMore: {
        document: require('~/graphql/RefreshEpisodePhases'),
        variables() {
          return { id: this.episodeId }
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          const newResult = { ...previousResult }
          newResult.story_chapter_by_pk.sections = [...subscriptionData.data.story_chapter_by_pk.sections]
          return newResult
        },
      },
    },
    npcs: {
      query: require('~/graphql/GetCharacters'),
      variables() {
        return { storyId: this.storyId, storyIsNull: false }
      },
      update: data => data.inStory,
    },
    fallbackNPCs: {
      query: require('~/graphql/GetCharacters'),
      variables() {
        return { storyId: null, storyIsNull: true }
      },
      update: data => data.fallback,
    },
  },
  data: () => ({
    // timeout: null,
  }),
  computed: {
    ...mapState(['currentPhases']),
    ...mapGetters('user', ['may']),
    data() {
      if (this.currentPhases) {
        this.updatePhases(this.currentPhases)
        return this.currentPhases
      }
      this.updatePhases(this.phases)
      return this.phases
    },
    editingProhibited() {
      const needs = 'edit_episode_narrative'
      const to = 'edit'
      const { may, storyId } = this
      return to === 'edit' && !may(needs, storyId)
    },
    storyId() {
      return this.$route.params.story
    },
    episodeId() {
      return this.$route.params.episode
    },
  },
  watch: {
    phases(val) {
      // this.$apollo.queries.phases.skip = true
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        this.updateCurrentPhases(this.phases)
      }, 1000)
    },
  },
  methods: {
    ...mapMutations([
      'updatePhases',
      'updateCurrentPhases',
    ]),
  },
}
</script>
