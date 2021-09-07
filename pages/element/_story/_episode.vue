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
          <episode-tab
            :episode="data.story_chapter_by_pk"
          >
            <container
              group-name="episode-specs"
              drag-handle-selector=".content-editor-draggable-handle"
              :get-child-payload="(index) => ({phaseId: data.story_chapter_by_pk.sections[index - 1].id})"
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
                            @change="edit('phase', phase.id, 'title', $event, data.story_chapter_by_pk.edit)"
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
                                      @click="addPhase({after: phase, duplicate: true, editField: data.story_chapter_by_pk.edit})"
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
                                      @click="deletePhase(phase, data.story_chapter_by_pk.edit)"
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
                            @change="edit('phase', phase.id, 'specs', $event, data.story_chapter_by_pk.edit)"
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

                          <v-row>
                            <topics-selector
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
                      @click="addPhase({after: phase, editField: data.story_chapter_by_pk.edit})"
                    >
                      <v-icon color="white">
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </v-container>
                </v-sheet>
              </draggable>

              <finish-work-btn
                v-if="data.story_chapter_by_pk.edit.state === 'specs'"
                :privileges="privileges"
                privilege-needed-to-commit="CommitEpisodeSpecs"
                finish-work="to enable editing execution details"
                :loading="isCommittingEpisodeSpecs"
                @commit="commitEpisodeSpecs"
                @request-approvement="issuePullRequestForEpisodeSpecs"
              />
            </container>
          </episode-tab>
        </v-tab-item>

        <!-- ========================================================================== -->

        <v-tab-item class="content-editor-messages">
          <apollo-query
            v-slot="gem"
            :query="require('~/graphql/GetEpisodeMessages')"
            :variables="{id: episodeId}"
          >
            <div v-if="gem.result.loading">
              <v-skeleton-loader
                v-for="n in 5"
                :key="n"
                type="list-item"
              />
            </div>

            <div v-else-if="gem.result.error">
              An error occurred!
            </div>

            <episode-tab
              v-else-if="gem.result.data"
              detail="narrative"
              :episode="data.story_chapter_by_pk"
              :narrative-data="gem.result.data.story_chapter_by_pk"
              @goto-episode-specs="activateSpecsTab"
            >
              <!-- <apollo-subscribe-to-more
          :document="require('~/graphql/RefreshEpisodeMessages')"
          :variables="{id: episodeId}"
          :update-query="refreshEpisodeMessages"
          /> -->
              <template v-for="(phase, phaseIndex) in data.story_chapter_by_pk.sections">
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
                    v-for="message in gem.result.data.story_chapter_by_pk.sections[phaseIndex].prompts"
                    :key="message.id"
                    :message="message"
                    :deletable="gem.result.data.story_chapter_by_pk.sections[phaseIndex].prompts.length > 1"
                    :course-name="data.story_chapter_by_pk.story.id"
                  />
                </container>
              </template>
            </episode-tab>
          </apollo-query>
        </v-tab-item>

        <!-- ========================================================================== -->

        <v-tab-item class="content-editor-interactions">
          <episode-tab
            :episode="data.story_chapter_by_pk"
            detail="chatbot"
            @goto-episode-specs="activateSpecsTab"
          >
            Episode chatbot interactions for "{{ data.story_chapter_by_pk.title }}"
          </episode-tab>
        </v-tab-item>

        <!-- ========================================================================== -->

        <v-tab-item class="content-editor-challenge">
          <episode-tab
            :episode="data.story_chapter_by_pk"
            detail="math"
            @goto-episode-specs="activateSpecsTab"
          >
            Episode challenge for "{{ data.story_chapter_by_pk.title }}"
          </episode-tab>
        </v-tab-item>

        <!-- ========================================================================== -->

        <v-tab-item class="content-editor-feedback">
          <episode-tab
            :episode="data.story_chapter_by_pk"
            detail="feedback"
            @goto-episode-specs="activateSpecsTab"
          >
            Episode test &amp; feedback for "{{ data.story_chapter_by_pk.title }}"
          </episode-tab>
        </v-tab-item>

        <!-- ========================================================================== -->

        <v-tab-item class="content-editor-meta">
          <v-text-field
            label="Episode Title"
            :value="data.story_chapter_by_pk.title"
            @change="edit('episode', episodeId, 'title', $event, data.story_chapter_by_pk.edit)"
          />
        </v-tab-item>
      </v-tabs-items>

      <specs-have-changed-warning
        v-if="data.story_chapter_by_pk.story.edit.state !== 'specs'
          && data.story_chapter_by_pk.edit.warnStorySpecsHaveChanged"
        title="The story specs for this episode have changed!"
        btn-text="Yes, the episode is alright like this"
        @confirm="closeStorySpecsHaveChangedWarning"
      />
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
    tab: 0,
    isCommittingEpisodeSpecs: false
  }),
  head () {
    return {
      title: 'Episode View' // TODO: One day, move apollo query into <script> to make it accessible from here and change title to sth like "Episode 1"
    }
  },
  computed: {
    storyId () {
      return this.$route.params.story
    },
    episodeId () {
      return this.$route.params.episode
    },
    privileges () {
      const priv = this.$store.state.user.privileges
      return priv ? priv[this.storyId] : []
    }
  },
  methods: {
    refreshEpisode (previousResult, { subscriptionData }) {
      if (previousResult) {
        console.log('refreshEpisode', { previousResult, subscriptionData })
        const newQueryResult = subscriptionData.data.story_chapter_by_pk
        const newPhases = newQueryResult.sections
        const newEpisode = {
          story_chapter_by_pk: {
            id: previousResult.story_chapter_by_pk.id,
            ...newQueryResult
          }
        }
        newEpisode.story_chapter_by_pk.story.edit.state = newQueryResult.story.edit.state
        newEpisode.story_chapter_by_pk.sections = JSON.parse(JSON.stringify(newPhases))
        return newEpisode
      }
    },
    updateEpisodeEditStateToSpecsIfNull (editField) {
      if (!('state' in editField)) {
        this.$apollo.mutate({
          mutation: require('~/graphql/UpdateEpisodeEditState'),
          variables: {
            id: this.episodeId,
            state: 'specs'
          }
        })
      }
    },
    async addPhase ({ after, duplicate = false, editField }) {
      this.updateEpisodeEditStateToSpecsIfNull(editField)
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
    async deletePhase (phase, editField) {
      if (confirm('Are you sure you want to delete phase ' + phase.number + ', "' + phase.title + '"?')) {
        this.updateEpisodeEditStateToSpecsIfNull(editField)
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
    edit (what, id, element, value, editField) {
      this.updateEpisodeEditStateToSpecsIfNull(editField)
      const capital = s => s.substr(0, 1).toUpperCase() + s.substr(1)
      const variables = { id }
      variables[element] = value
      this.pushChange({
        change: {
          mutation: require('~/graphql/Update' + capital(what) + capital(element)),
          variables
        },
        dispatch: this.$store.dispatch
      })
    },
    async commitEpisodeSpecs () {
      this.isCommittingEpisodeSpecs = true
      await this.$apollo.mutate({
        mutation: require('~/graphql/EnterEpisodeDetailsExecution'),
        variables: {
          id: this.episodeId
        }
      })
      this.isCommittingEpisodeSpecs = false
    },
    issuePullRequestForEpisodeSpecs () {
      console.log('PULL REQUEST')
    },
    closeStorySpecsHaveChangedWarning () {
      this.$apollo.mutate({
        mutation: require('~/graphql/UpdateEpisodeEditWarnStorySpecsHaveChanged'),
        variables: {
          id: this.episodeId,
          warnStorySpecsHaveChanged: false
        }
      })
    },
    activateSpecsTab () {
      this.tab = 0
    },
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
