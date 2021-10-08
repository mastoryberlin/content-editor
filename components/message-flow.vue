<template>
  <div>
    <template v-if="$apollo.loading">
      <v-skeleton-loader v-for="n in 5" :key="n" type="list-item" />
    </template>

    <template v-else-if="$apollo.error">
      An error occurred!
    </template>

    <privileged-area v-else needs="edit_episode_narrative" to="edit">
      <template v-if="phases">
        <template v-for="(phase, phaseIndex) in phases">
          <div
            :key="phase.id + '-fixed'"
            class="my-7 pa-4 content-editor-specs-fixed"
          >
            <h2>#{{ phaseIndex + 1 }}: {{ phase.title }}</h2>
            <p>{{ phase.specs }}</p>
          </div>
          <container
            :key="phase.id + '-messages'"
            group-name="episode-messages"
            drag-handle-selector=".content-editor-draggable-handle"
            :get-child-payload="(index) => {
              const msg = topLevelMessages(phase)[index]
              const {id, number} = msg
              setDraggedMessageInfo({id, number, index})
            }"
            @drag-start="
              setDragSource({
                ...$event,
                dragSource: phase,
                fromPhase: phase.id,
                fromParentIsNull: true
              })
            "
            @drop="
              moveMessage({
                ...$event,
                dragTarget: phase,
                toPhase: phase.id,
                toParentIsNull: true
              })
            "
          >
            <message-group
              v-for="message in topLevelMessages(phase)"
              :key="message.id"
              :all-messages-in-this-phase="phase.prompts"
              :message="message"
              :deletable="phase.prompts.length > 1"
              :disabled="editingProhibited"
              :course-name="storyId"
            />
          </container>
        </template>
        <div class="d-flex flex-row justify-space-between ma-5">
          <finish-work-btn
            :tab-type="'message-flow'"
            :button-type="'issue-pr'"
          />
          <finish-work-btn :tab-type="'message-flow'" :button-type="'commit'" />
        </div>

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
import { mapGetters, mapMutations, mapActions } from 'vuex'

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
    ...mapGetters('user', ['may']),
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
  methods: {
    ...mapMutations([
      'setDraggedMessageInfo',
      'setDragSource',
    ]),
    ...mapActions([
      'moveMessage',
    ]),
    topLevelMessages(phase) {
      return phase.prompts.filter(
        p => p.parent === null
      )
    },
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
