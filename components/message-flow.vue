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

    <privileged-area
      v-else
      needs="edit_episode_narrative"
      to="edit"
    >
      <template v-if="phases">
        <template v-for="(phase, phaseIndex) in phases">
          <div
            :key="phase.id + '-fixed'"
            class="my-7 pa-4 content-editor-specs-fixed"
          >
            <h2>#{{ phaseIndex + 1 }}: {{ phase.title }}</h2>
            <p>{{ phase.specs }}</p>
          </div>
          <!-- :get-child-payload="setDragIndex" -->
          <container
            :key="phase.id + '-messages'"
            group-name="episode-messages"
            drag-handle-selector=".content-editor-draggable-handle"
            @drag-start="setDragSource({
              ...$event,
              dragSource: phase
            })"
            @drop="moveMessage({
              ...$event,
              dragTarget: phase
            })"
          >
            <message-group
              v-for="message in phases[phaseIndex].prompts.filter(p => p.parent === null)"
              :key="message.id"
              :all-messages-in-this-phase="phases[phaseIndex].prompts"
              :message="message"
              :deletable="phases[phaseIndex].prompts.length > 1"
              :course-name="storyId"
            />
          </container>
        </template>

      <!-- <finish-work-btn
      v-if="data.story_chapter_by_pk.edit.state === 'details'"
        :may-commit="mayCommitMessageFlow"
        :loading="isCommittingMessageFlow"
        @commit="commitMessageFlow"
      /> -->
      </template>
    </privileged-area>
  </div>
</template>

<script>
import { Container } from 'vue-smooth-dnd'

export default {
  components: {
    Container,
  },
  props: {
    episode: {
      type: Object,
      required: true,
    },
  },
  apollo: {
    phases: {
      query: require('~/graphql/GetEpisodeMessages'),
      variables() {
        return { id: this.episodeId }
      },
      update: data => data.story_chapter_by_pk.sections,
      subscribeToMore: {
        document: require('~/graphql/RefreshEpisodeMessages'),
        variables() {
          return { id: this.episodeId }
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          const newResult = { ...previousResult }
          newResult.story_chapter_by_pk.sections = JSON.parse(JSON.stringify(subscriptionData.data.story_chapter_by_pk.sections))
          return newResult
        },
      },
    },
  },
  data: () => ({
  }),
  computed: {
    storyId() {
      return this.$route.params.story
    },
    episodeId() {
      return this.$route.params.episode
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
