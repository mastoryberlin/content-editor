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
        <template v-for="(phase, phaseIndex) in data">
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
              :npcs-available-in-this-phase="availableNPCs[phase.id]"
              :message="message"
              :phase="phase"
              :deletable="phase.prompts.length > 1"
              :disabled="editingProhibited"
              :course-name="storyId"
            />
          </container>
        </template>

        <div class="d-flex flex-row justify-space-between ma-5">
          <finish-work-btn tab-type="message-flow" button-type="commit" />
          <finish-work-btn tab-type="message-flow" button-type="issue-pr" />
        </div>
      </template>
    </privileged-area>
  </div>
</template>

<script>
import { Container } from 'vue-smooth-dnd'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

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
    availableNPCs() {
      let npcs = this.npcs
      if (npcs.length === 0) { npcs = this.fallbackNPCs }
      npcs = npcs.map(npc => npc.id)
      return Object.fromEntries(
        this.phases.map((phase) => {
          const { id, meta } = phase
          const avail = npcs.filter(npc => meta.mood[npc] !== 'unavailable')
          return [id, avail]
        })
      )
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
      'setDraggedMessageInfo',
      'setDragSource',
      'updatePhases',
      'updateCurrentPhases',
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
