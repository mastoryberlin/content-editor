<template lang="html">
  <apollo-query
    v-slot="{ result: { loading, error, data } }"
    :query="require('~/graphql/GetStory')"
    :variables="{id: storyId}"
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
        :document="require('~/graphql/RefreshStory')"
        :variables="{id: storyId}"
        :update-query="refreshStory"
      />
      <v-tabs v-model="tab">
        <v-tab>
          Specs
        </v-tab>
        <v-tab>
          Meta
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item class="content-editor-specs">
          <v-overlay
            absolute
            :value="data.story_by_pk.edit.state === 'episodes'"
          >
            <p>
              We are currently editing <strong>individual episodes</strong> of "{{ data.story_by_pk.title }}".
            </p>

            <p>
              Click on an episode node in the left navigation pane to edit it.
            </p>

            <v-btn
              color="orange"
              elevation="3"
              :loading="isReopeningStorySpecs"
              :disabled="isReopeningStorySpecs"
              @click="uncommitStorySpecs"
            >
              Edit story specs again
            </v-btn>
          </v-overlay>

          <p>
            Enter here the story specs for “{{ data.story_by_pk.title }}”
            by adding a new card for each episode.
          </p>

          <template v-if="showFreeflow">
            <p>
              You can also write the specs into this free-flow input field
              and click one of the options below it to generate episode cards
              for each paragraph. <a @click.stop.prevent="showFreeflow = false">Hide</a>
            </p>

            <freeflow-specs-field
              scope="story"
              field="description"
              :data-object="data.story_by_pk"
              :ref-id="storyId"
              @generate-specs="generateSpecsFromFreeflow"
            />
          </template>

          <p v-else>
            Click <a @click.stop.prevent="showFreeflow = true">here</a>
            if you prefer to write the story specs in a free-flow format at first.
          </p>

          <container
            group-name="story-specs"
            drag-handle-selector=".content-editor-draggable-handle"
            :get-child-payload="(index) => ({episodeId: data.story_by_pk.chapters[index].id})"
            @drop="onDrop"
          >
            <draggable v-for="(episode, i) in data.story_by_pk.chapters" :key="i">
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

                      <v-tooltip
                        v-if="episode.editedBy"
                        right
                      >
                        <template
                          #activator="{on, attrs}"
                        >
                          <v-icon
                            v-bind="attrs"
                            v-on="
                              on"
                          >
                            mdi-lock
                          </v-icon>
                        </template>
                        <span>This episode is currently being edited by {{ episode.editedBy }}</span>
                      </v-tooltip>
                    </v-col>

                    <v-col class="content-editor-draggable-content">
                      <div class="content-editor-draggable-title">
                        <v-textarea
                          :value="episode.title"
                          class="text-h5"
                          filled
                          rounded
                          full-width
                          rows="1"
                          auto-grow
                          :prefix="`E.${i+1}: `"
                          background-color="white"
                          label="Enter a title for this episode"
                          :disabled="!!episode.editedBy"
                          @focus="startEditing(episode, 'title')"
                          @blur="stopEditing"
                          @change="pushChange({
                            change: {
                              mutation: require('~/graphql/UpdateEpisodeTitle'),
                              variables: {id: episode.id, title: $event}
                            },
                            dispatch: $store.dispatch
                          })"
                        >
                          <template #append>
                            <v-tooltip bottom>
                              <template #activator="{on, attrs}">
                                <v-hover v-slot="{ hover }">
                                  <v-icon
                                    v-bind="attrs"
                                    :color="hover ? 'purple' : 'grey lighten-2'"
                                    v-on="on"
                                    @click="$router.push(`/element/${storyId}/${episode.id}`)"
                                  >
                                    mdi-open-in-new
                                  </v-icon>
                                </v-hover>
                              </template>
                              <span>
                                Edit episode details
                              </span>
                            </v-tooltip>
                          </template>

                          <template #append-outer>
                            <v-tooltip bottom>
                              <template #activator="{on, attrs}">
                                <v-hover v-slot="{ hover }">
                                  <v-icon
                                    v-bind="attrs"
                                    class="ml-2"
                                    :color="hover ? 'blue' : 'grey lighten-2'"
                                    v-on="on"
                                    @click="addEpisode({ after: episode, duplicate: true })"
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
                              v-if="data.story_by_pk.chapters.length > 1"
                              bottom
                            >
                              <template #activator="{on, attrs}">
                                <v-hover v-slot="{ hover }">
                                  <v-icon
                                    v-bind="attrs"
                                    class="ml-2"
                                    :color="hover ? 'red' : 'grey lighten-2'"
                                    :disabled="!!episode.editedBy"
                                    v-on="on"
                                    @click="deleteEpisode(episode)"
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
                          :value="episode.specs"
                          full-width
                          outlined
                          auto-grow
                          rows="2"
                          label="Enter this episode's specs here"
                          :disabled="!!episode.editedBy"
                          @focus="startEditing(episode, 'specs')"
                          @blur="stopEditing"
                          @change="pushChange({
                            change: {
                              mutation: require('~/graphql/UpdateEpisodeSpecs'),
                              variables: {id: episode.id, specs: $event}
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
                              :phase="episode.sections[0]"
                              :npc="character"
                            />
                          </v-col>
                        </v-row>

                        <v-row>
                          <features-selector
                            :phase="episode.sections[0]"
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
                    @click="addEpisode({ after: episode })"
                  >
                    <v-icon color="white">
                      mdi-plus
                    </v-icon>
                  </v-btn>
                </v-container>
              </v-sheet>
            </draggable>
          </container>

          <v-dialog
            v-model="showCommitMessageDialog"
            max-width="500px"
          >
            <template #activator="{on, attrs}">
              <finish-work-btn
                v-if="data.story_by_pk.edit.state === 'specs'"
                :privileges="privileges"
                privilege-needed-to-commit="CommitStorySpecs"
                finish-work="to enable editing individual episodes"
                :loading="isCommittingStorySpecs"
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-card>
              <v-card-title class="text-h5">
                Commit your work
              </v-card-title>
              <v-card-text>
                <v-form @submit.prevent="commitStorySpecs">
                  Please enter some words that describe the changes you have made.
                  <v-text-field
                    v-model="commitMessage"
                    autofocus
                  />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn type="submit" color="green">
                  OK
                </v-btn>
                <v-btn @click="showCommitMessageDialog = false">
                  Cancel
                </v-btn>
                <v-spacer />
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-tab-item>

        <v-tab-item class="content-editor-meta">
          <v-text-field
            label="Story Title"
            :value="data.story_by_pk.title"
            @change="$apollo.mutate({
              mutation: require('~/graphql/UpdateStoryTitle'),
              variables: {id: storyId, title: $event}
            })"
          />
        </v-tab-item>
      </v-tabs-items>
    </div>
  </apollo-query>
</template>

<script>
import { Container, Draggable } from 'vue-smooth-dnd'
import { mapActions, mapMutations } from 'vuex'

export default {
  components: {
    Container,
    Draggable
  },
  data: () => ({
    tab: 0,
    noUpdatesFrom: { id: null, field: null },
    isCommittingStorySpecs: false,
    isReopeningStorySpecs: false,
    showFreeflow: false,
    showCommitMessageDialog: false,
    commitMessage: ''
  }),
  head: {
    title: 'Story View'
  },
  computed: {
    storyId () {
      return this.$route.params.story
    },
    privileges () {
      const priv = this.$store.state.user.privileges
      return priv ? priv[this.storyId] : []
    }
  },
  methods: {
    generateSpecsFromFreeflow (text) {
      console.log(text)
    },
    startEditing (element, field) {
      this.noUpdatesFrom = {
        id: element ? element.id : null,
        field
      }
      console.log('startEditing', this.noUpdatesFrom)
    },
    stopEditing () {
      this.noUpdatesFrom = null
    },

    // Handle subscription updates
    refreshStory (previousResult, { subscriptionData }) {
      console.log('refreshStory', { previousResult, subscriptionData })
      const previous = previousResult.story_by_pk
      const updated = subscriptionData.data.story_by_pk
      if (this.noUpdatesFrom) {
        const { id, field } = this.noUpdatesFrom
        if (id) {
          // some episode is being edited
          const eps = updated.chapters
          const ep = eps.find(e => e.id === id)
          const index = eps.indexOf(ep)
          eps[index] = JSON.parse(JSON.stringify(previous.chapters[index]))
        } else {
          // story's top level properties are being edited
          delete updated[field]
        }
      }
      const newStory = {
        story_by_pk: {
          id: previous.id,
          ...updated
        }
      }
      newStory.story_by_pk.chapters = JSON.parse(JSON.stringify(updated.chapters))
      newStory.story_by_pk.edit.state = updated.edit.state
      console.log('returning', newStory)
      return newStory
    },

    async addEpisode ({ after, duplicate = false }) {
      const number = after.number ? after.number + 1 : 1
      const variables = {
        storyId: this.storyId,
        number
      }
      if (duplicate) {
        Object.assign(variables, {
          title: after.title,
          description: after.description,
          specs: after.specs
        })
      }
      const { data } = await this.$apollo.mutate({
        mutation: require('~/graphql/AddEpisode'),
        variables
      })
      await this.$apollo.mutate({
        mutation: require('~/graphql/AddPhase'),
        variables: {
          episodeId: data.insert_story_chapter_one.id,
          number: 1,
          meta: JSON.parse(JSON.stringify(after.sections[after.sections.length - 1].meta))
        }
      })
    },

    async deleteEpisode (episode) {
      const title = episode.title === '' ? '' : ', "' + episode.title + '"'
      if (confirm('Are you sure you want to delete episode ' + episode.number + title + '?')) {
        await this.$apollo.mutate({
          mutation: require('~/graphql/DeleteEpisode'),
          variables: {
            id: episode.id,
            storyId: this.storyId,
            number: episode.number
          }
        })
      }
    },

    async onDrop ({ removedIndex, addedIndex, payload }) {
      if (removedIndex !== addedIndex) {
        const from = removedIndex + 1
        const to = addedIndex + 1
        console.log('dragdrop episode', from, to)
        await this.$apollo.mutate({
          mutation: require('~/graphql/MoveEpisode'),
          variables: {
            id: payload.episodeId,
            storyId: this.storyId,
            from,
            to
          }
        })
      }
    },

    async commitStorySpecs () {
      this.showCommitMessageDialog = false
      this.isCommittingStorySpecs = true
      const mayCommit = this.privileges.includes('CommitStorySpecs')
      await this.$axios.post('commit/story-specs', {
        storyId: this.storyId,
        commitMessage: this.commitMessage,
        pullRequest: !mayCommit
      })
      await this.$apollo.mutate({
        mutation: require('~/graphql/UpdateStoryEditState'),
        variables: {
          id: this.storyId,
          state: mayCommit ? 'episodes' : 'specs-pr'
        }
      })
      this.commitMessage = ''
      this.isCommittingStorySpecs = false
    },

    async uncommitStorySpecs (currentState) {
      await this.$apollo.mutate({
        mutation: require('~/graphql/UpdateStoryEditState'),
        variables: {
          id: this.storyId,
          state: 'specs'
        }
      })
    },

    ...mapMutations('autosave', [
      'pushChange'
    ]),

    ...mapActions([
      'lock',
      'unlock'
    //   'add',
    //   'edit'
    ])
  }
}
</script>

<style lang="sass">
</style>
