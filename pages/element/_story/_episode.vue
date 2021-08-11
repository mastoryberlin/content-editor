<template lang="html">
  <div class="content-editor">
    <v-tabs v-model="tab">
      <v-tab>
        Specs
      </v-tab>
      <v-tab>
        Meta
      </v-tab>
      <v-tab>
        Messages
      </v-tab>
      <v-tab>
        Challenge
      </v-tab>
      <v-tab>
        Tests &amp; Feedback
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item class="content-editor-specs">
        <div
          v-if="episodeInfo"
          class="my-7 pa-4 content-editor-specs-fixed"
        >
          <h2>
            Episode {{ episodeNumber }}: {{ episodeInfo.title }}
            <v-tooltip bottom>
              <template #activator="{on, attrs}">
                <v-hover v-slot="{ hover }">
                  <v-icon
                    v-bind="attrs"
                    :color="hover ? 'purple' : 'grey darken-2'"
                    v-on="on"
                    @click="$router.push(`/element/${story}#${episode}`)"
                  >
                    mdi-open-in-new
                  </v-icon>
                </v-hover>
              </template>
              <span>
                Edit story specs for this episode
              </span>
            </v-tooltip>
          </h2>
          <p v-text="episodeInfo.specs" />
        </div>

        <container
          group-name="episode-specs"
          drag-handle-selector=".content-editor-draggable-handle"
          @drop="onDrop"
        >
          <draggable v-for="(phase, phaseIndex) in phases" :key="phase.id">
            <v-sheet
              elevation="2"
              rounded
              class="mx-4 my-8 pa-3 content-editor-draggable"
            >
              <v-container>
                <v-row cols="12">
                  <v-col class="content-editor-draggable-sidebar">
                    <v-icon
                      class="content-editor-draggable-handle"
                    >
                      mdi-drag
                    </v-icon>
                  </v-col>

                  <v-col class="content-editor-draggable-content">
                    <div class="content-editor-draggable-title">
                      <v-textarea
                        :value="phase.title"
                        class="text-h5"
                        filled
                        rounded
                        autofocus
                        single-line
                        full-width
                        rows="1"
                        auto-grow
                        :prefix="`#${phaseIndex + 1}: `"
                        background-color="white"
                        label="Enter a title for this phase"
                        @input="changePhase({id: phase.id, element: 'title', to: $event})"
                      >
                        <template #append-outer>
                          <v-tooltip bottom>
                            <template #activator="{on, attrs}">
                              <v-hover v-slot="{ hover }">
                                <v-icon
                                  v-bind="attrs"
                                  class="ml-2"
                                  :color="hover ? 'blue' : 'grey lighten-2'"
                                  v-on="on"
                                  @click="addPhase({after: phase, duplicate: true})"
                                >
                                  mdi-content-duplicate
                                </v-icon>
                              </v-hover>
                            </template>
                            <span>
                              Duplicate
                            </span>
                          </v-tooltip>

                          <v-tooltip
                            v-if="phases.length > 1"
                            bottom
                          >
                            <template #activator="{on, attrs}">
                              <v-hover v-slot="{ hover }">
                                <v-icon
                                  v-bind="attrs"
                                  class="ml-2"
                                  :color="hover ? 'red' : 'grey lighten-2'"
                                  v-on="on"
                                  @click="deletePhase(phase)"
                                >
                                  mdi-delete
                                </v-icon>
                              </v-hover>
                            </template>
                            <span>
                              Delete
                            </span>
                          </v-tooltip>
                        </template>
                      </v-textarea>
                    </div>

                    <div class="content-editor-draggable-specs">
                      <v-textarea
                        :value="phase.specs"
                        full-width
                        outlined
                        auto-grow
                        rows="2"
                        label="Enter the specs for this phase here"
                        @input="changePhase({id: phase.id, element: 'specs', to: $event})"
                      />
                    </div>
                  </v-col><!-- content-editor-draggable-content -->

                  <v-divider
                    class="mx-4"
                    vertical
                  />

                  <v-col class="content-editor-draggable-meta">
                    <v-container>
                      <v-row cols="4">
                        <v-col
                          v-for="character in ['Professor', 'Alicia', 'Nick', 'VZ']"
                          :key="character"
                        >
                          <mood-selector
                            :phase="phase"
                            :npc="character"
                          />
                        </v-col>
                      </v-row>

                      <v-row>
                        <features-selector
                          :phase="phase"
                        />
                      </v-row>
                    </v-container>
                  </v-col>
                </v-row>

                <v-btn
                  fab
                  size="12"
                  color="green"
                  class="content-editor-draggable-add"
                  @click="addPhase({after: phase})"
                >
                  <v-icon color="white">
                    mdi-plus
                  </v-icon>
                </v-btn>
              </v-container>
            </v-sheet>
          </draggable>
        </container>
      </v-tab-item>

      <v-tab-item class="content-editor-meta">
        Episode meta for "{{ episodeInfo.title }}"
      </v-tab-item>

      <v-tab-item class="content-editor-messages">
        <template v-for="(phase, phaseIndex) in episodeInfo.phases">
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
            :get-child-payload="setDragIndex"
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
              v-for="message in phase.messages"
              :key="message.id"
              :message="message"
              :deletable="phase.messages.length > 1"
            />
          </container>
        </template>
      </v-tab-item>
      </v-tab-items>
    </v-tabs-items>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import { Container, Draggable } from 'vue-smooth-dnd'

export default {
  components: {
    Container,
    Draggable
  },
  data: () => ({
    tab: 0
  }),
  computed: {
    story () {
      return this.$route.params.story
    },
    episode () {
      return this.$route.params.episode
    },
    storyInfo () {
      return this.$store.state.stories.find(s => s.id === this.story)
    },
    episodeInfo () {
      const st = this.storyInfo
      return st
        ? st.episodes.find(e => e.id === `${this.story}/${this.episode}`)
        : undefined
    },
    episodeNumber () {
      const st = this.storyInfo
      const ep = this.episodeInfo
      return st && ep
        ? st.episodes.indexOf(ep) + 1
        : '???'
    },
    phases: {
      get () {
        return this.episodeInfo ? this.episodeInfo.phases : []
      },
      set (v) {
        if (this.episodeInfo) {
          this.episodeInfo.phases = v
        }
      }
    }
  },
  methods: {
    ...mapMutations([
      'movePhase',
      'changePhase',
      'addPhase',
      'deletePhase',
      'changeMessage',
      'addMessage',
      'deleteMessage',
      'moveMessage',
      'setDragIndex',
      'setDragSource'
    ]),
    onDrop ({ removedIndex, addedIndex }) {
      this.movePhase({
        episode: this.episodeInfo.id,
        removedIndex,
        addedIndex
      })
    }
  }
}
</script>
