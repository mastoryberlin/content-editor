<template lang="html">
  <div class="">
    <template v-if="$apollo.loading">
      <v-skeleton-loader type="image@3" />
      <v-skeleton-loader v-for="n in 5" :key="n" type="list-item" />
    </template>

    <template v-else-if="$apollo.error">
      An error occurred!
    </template>

    <template v-else-if="phase">
      <div
        :key="phase.id + '-fixed'"
        class="my-7 pa-4 content-editor-specs-fixed"
      >
        <h2>#{{ phase.number }}: {{ phase.title }}</h2>
        <p>{{ phase.specs }}</p>

        <v-menu>
          <template #activator="{attrs, on}">
            <v-icon v-bind="attrs" v-on="on">
              mdi-dots-horizontal
            </v-icon>
          </template>
          <v-list>
            <v-list-item v-for="item in phaseMenu" :key="item.title" @click="item.action">
              <v-list-item-title v-text="item.title" />
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <container
        :key="phase.id + '-messages'"
        group-name="episode-messages"
        drag-handle-selector=".content-editor-draggable-handle"
        :get-child-payload="(index) => {
          const msg = topLevelMessages[index]
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
        <lazy-message-group
          v-for="message in topLevelMessages"
          :key="message.id"
          :all-messages-in-this-phase="phase.prompts"
          :npcs-available-in-this-phase="availableNPCs"
          :message="message"
          :phase="phase"
          :deletable="phase.prompts.length > 1"
          :disabled="disabled"
          :course-name="storyId"
        />
      </container>
    </template>
  </div>
</template>

<script>
import { Container } from 'vue-smooth-dnd'
import { mapMutations, mapActions } from 'vuex'

export default {
  components: {
    Container,
  },
  apollo: {
    phase: {
      query: require('~/graphql/GetPhaseMessages'),
      variables() {
        return { id: this.phaseId }
      },
      update: data => data.story_section_by_pk,
      subscribeToMore: {
        document: require('~/graphql/RefreshPhaseMessages'),
        variables() {
          return { id: this.phaseId }
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          const newResult = { ...previousResult }
          newResult.story_section_by_pk = { ...subscriptionData.data.story_section_by_pk }
          newResult.story_section_by_pk.prompts = JSON.parse(JSON.stringify(subscriptionData.data.story_section_by_pk.prompts))
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
  props: {
    disabled: {
      type: Boolean,
      default: true,
    },
    phaseId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      phaseMenu: [
        { title: 'Restore message order of top-level messages in this phase (click this when encountering Drag&Drop malfunction)', action: this.restoreNumbers },
      ],
    }
  },
  computed: {
    availableNPCs() {
      let npcs = this.npcs
      if (npcs.length === 0) { npcs = this.fallbackNPCs }
      npcs = npcs.map(npc => npc.id)
      const { meta } = this.phase
      return npcs.filter(npc => meta.mood[npc] !== 'unavailable')
    },
    topLevelMessages() {
      return this.phase.prompts.filter(
        p => p.parent === null
      )
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

    restoreNumbers() {
      const { topLevelMessages } = this
      if (topLevelMessages) {
        topLevelMessages.forEach((msg, i) => {
          this.$apollo.mutate({
            mutation: require('~/graphql/UpdateMessageNumber'),
            variables: {
              id: msg.id,
              number: i + 1,
            },
          })
        })
      }
    },
  },
}
</script>
