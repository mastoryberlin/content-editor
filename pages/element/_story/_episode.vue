<template lang="html">
  <apollo-query
    v-slot="{ result: { loading, error, data } }"
    :query="require('~/graphql/GetEpisode')"
    :variables="{id: episodeId}"
  >
    <div v-if="loading">
      <v-skeleton-loader
        v-for="n in 5"
        :key="n"
        type="list-item"
      />
    </div>

    <div v-else-if="error">
      An error occurred!
    </div>

    <div
      v-else-if="data"
      class="content-editor"
    >
      <apollo-subscribe-to-more
        :document="require('~/graphql/RefreshEpisode')"
        :variables="{id: episodeId}"
        :update-query="refreshEpisode"
      />
      <v-tabs v-model="tab">
        <v-tab v-text="'Specs'" />
        <v-tab v-text="'Message Flow'" />
        <v-tab v-text="'Chatbot Interaction'" />
        <v-tab v-text="'Math Challenges'" />
        <v-tab v-text="'Tests &amp; Feedback'" />
        <v-tab v-text="'Meta'" />
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item class="content-editor-specs">
          <div class="my-7 pa-4 content-editor-specs-fixed">
            <h2>
              Episode {{ data.story_chapter_by_pk.number }}: {{ data.story_chapter_by_pk.title }}
              <v-tooltip bottom>
                <template #activator="{on, attrs}">
                  <v-hover v-slot="{ hover }">
                    <v-icon
                      v-bind="attrs"
                      :color="hover ? 'purple' : 'grey darken-2'"
                      v-on="on"
                      @click="$router.push(`/element/${storyId}#${episodeId}`)"
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
            <p v-text="data.story_chapter_by_pk.specs" />
          </div>

          <container
            group-name="episode-specs"
            drag-handle-selector=".content-editor-draggable-handle"
            :get-child-payload="(index) => ({phaseId: data.story_chapter_by_pk.sections[index].id})"
            @drop="onDrop"
          >
            <draggable v-for="(phase, phaseIndex) in data.story_chapter_by_pk.sections" :key="phase.id">
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
                          @input="pushChange({
                            change: {
                              mutation: require('~/graphql/UpdatePhaseTitle'),
                              variables: {id: phase.id, title: $event}
                            },
                            dispatch: $store.dispatch
                          })"
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
                              v-if="data.story_chapter_by_pk.sections.length > 1"
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
                          @input="pushChange({
                            change: {
                              mutation: require('~/graphql/UpdatePhaseSpecs'),
                              variables: {id: phase.id, specs: $event}
                            },
                            dispatch: $store.dispatch
                          })"
                        />
                      </div>
                    </v-col>

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

        <v-tab-item class="content-editor-messages">
          <!-- <template v-for="(phase, phaseIndex) in episodeInfo.phases">
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
          </template> -->
        </v-tab-item>

        <v-tab-item class="content-editor-interactions">
          Episode chatbot interactions for "{{ data.story_chapter_by_pk.title }}"
        </v-tab-item>

        <v-tab-item class="content-editor-challenge">
          Episode challenge for "{{ data.story_chapter_by_pk.title }}"
        </v-tab-item>

        <v-tab-item class="content-editor-feedback">
          Episode test &amp; feedback for "{{ data.story_chapter_by_pk.title }}"
        </v-tab-item>

        <v-tab-item class="content-editor-meta">
          <v-text-field
            label="Title"
            :value="data.story_chapter_by_pk.title"
            @input="pushChange({
              change: {
                mutation: require('~/graphql/UpdateEpisodeTitle'),
                variables: {id: episodeId, title: $event}
              },
              dispatch: $store.dispatch
            })"
          />
        </v-tab-item>

        </v-tab-items>
      </v-tabs-items>
    </div>
  </apollo-query>
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
    storyId () {
      return this.$route.params.story
    },
    episodeId () {
      return this.$route.params.episode
    }
  },
  methods: {
    refreshEpisode (previousResult, { subscriptionData }) {
      console.log('refreshEpisode', { previousResult, subscriptionData })
      const newQueryResult = subscriptionData.data.story_chapter_by_pk
      const newPhases = newQueryResult.sections
      const newEpisode = {
        story_chapter_by_pk: {
          id: previousResult.story_chapter_by_pk.id,
          ...newQueryResult
        }
      }
      newEpisode.story_chapter_by_pk.sections = JSON.parse(JSON.stringify(newPhases))
      return newEpisode
    },
    async addPhase ({ after, duplicate = false }) {
      const number = after.number ? after.number + 1 : 1
      const variables = {
        episodeId: this.episodeId,
        number,
        meta: JSON.parse(JSON.stringify(after.meta))
      }
      if (duplicate) {
        Object.assign(variables, {
          title: after.title,
          specs: after.specs
        })
      }
      const { data } = await this.$apollo.mutate({
        mutation: require('~/graphql/AddPhase'),
        variables
      })
      console.log('mutation AddPhase returned', data)
      // TODO: Add a message block
      // this.$apollo.mutate({
      //   mutation: require('~/graphql/AddPhase'),
      //   variables: {
      //     episodeId: data.insert_story_chapter_one.id
      //   }
      // })
    },
    async deletePhase (phase) {
      if (confirm('Are you sure you want to delete phase ' + phase.number + ', "' + phase.title + '"?')) {
        await this.$apollo.mutate({
          mutation: require('~/graphql/DeletePhase'),
          variables: {
            id: phase.id,
            episodeId: this.episodeId,
            number: phase.number
          }
        })
      }
    },
    ...mapMutations('autosave', [
      'pushChange'
    ]),
    async onDrop ({ removedIndex, addedIndex, payload }) {
      if (removedIndex !== addedIndex) {
        const from = removedIndex + 1
        const to = addedIndex + 1
        console.log('dragdrop phase', from, to)
        await this.$apollo.mutate({
          mutation: require('~/graphql/MovePhase'),
          variables: {
            id: payload.phaseId,
            episodeId: this.episodeId,
            from,
            to
          }
        })
      }
    }
  }
}
</script>
