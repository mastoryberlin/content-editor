<template>
  <apollo-query
    v-slot="{ result: { loading, error, data } }"
    :query="require('~/graphql/GetEpisode')"
    :variables="{ id: episodeId }"
  >
    <div v-if="loading">
      <v-skeleton-loader v-for="n in 5" :key="n" type="list-item" />
    </div>

    <div v-else-if="error">
      An error occurred!
    </div>

    <div v-else-if="data" class="content-editor">
      <apollo-subscribe-to-more
        :document="require('~/graphql/RefreshEpisode')"
        :variables="{ id: episodeId }"
        :update-query="refreshEpisode"
      />
      <v-tabs v-model="tab" @change="addTabToURL">
        <v-tab v-text="'Specs'" />
        <v-tab v-text="'Message Flow'" />
        <v-tab v-text="'Chatbot Interaction'" />
        <v-tab v-text="'Math Challenges'" />
        <v-tab v-text="'Tests &amp; Feedback'" />
        <v-tab v-text="'Meta'" />
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item class="content-editor-specs">
          <!-- =============================================================================== -->
          <!-- SPECS TAB -->
          <!-- =============================================================================== -->

          <episode-tab :episode="data.story_chapter_by_pk">
            <container
              behaviour="contain"
              orientation="vertical"
              drag-handle-selector=".content-editor-draggable-handle"
              group-name="episode-specs"
              :get-child-payload="(index) => ({ phaseId: data.story_chapter_by_pk.sections[index].id })"
              @drop="onDrop($event, data)"
            >
              <draggable
                v-for="(phase, phaseIndex) in data.story_chapter_by_pk.sections"
                :key="phase.id"
              >
                <v-sheet
                  elevation="2"
                  rounded
                  class="mx-4 my-8 pa-3 content-editor-draggable"
                >
                  <v-container>
                    <v-row cols="12">
                      <v-col class="content-editor-draggable-sidebar">
                        <v-icon class="content-editor-draggable-handle">
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
                            single-line
                            full-width
                            rows="1"
                            auto-grow
                            :prefix="`#${phaseIndex + 1}: `"
                            background-color="white"
                            label="Enter a title for this phase"
                            @change="
                              edit(
                                'phase',
                                phase.id,
                                'title',
                                $event,
                                data.story_chapter_by_pk.edit
                              )
                            "
                          >
                            <template #append-outer>
                              <v-tooltip bottom>
                                <template #activator="{ on, attrs }">
                                  <v-hover v-slot="{ hover }">
                                    <v-icon
                                      v-bind="attrs"
                                      class="ml-2"
                                      :color="hover ? 'blue' : 'grey lighten-2'"
                                      v-on="on"
                                      @click="
                                        addPhase({
                                          after: phase,
                                          duplicate: true,
                                          data,
                                        })
                                      "
                                    >
                                      mdi-content-duplicate
                                    </v-icon>
                                  </v-hover>
                                </template>
                                <span> Duplicate </span>
                              </v-tooltip>

                              <v-tooltip
                                v-if="
                                  data.story_chapter_by_pk.sections.length > 1
                                "
                                bottom
                              >
                                <template #activator="{ on, attrs }">
                                  <v-hover v-slot="{ hover }">
                                    <v-icon
                                      v-bind="attrs"
                                      class="ml-2"
                                      :color="hover ? 'red' : 'grey lighten-2'"
                                      v-on="on"
                                      @click="deletePhase(phase, data)"
                                    >
                                      mdi-delete
                                    </v-icon>
                                  </v-hover>
                                </template>
                                <span> Delete </span>
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
                            @change="
                              edit(
                                'phase',
                                phase.id,
                                'specs',
                                $event,
                                data.story_chapter_by_pk.edit
                              )
                            "
                          />
                        </div>
                      </v-col>

                      <v-divider class="mx-4" vertical />

                      <v-col class="content-editor-draggable-meta">
                        <v-container>
                          <v-row cols="4">
                            <v-col
                              v-for="character in [
                                'Professor',
                                'Alicia',
                                'Nick',
                                'VZ',
                              ]"
                              :key="character"
                            >
                              <mood-selector :phase="phase" :npc="character" :data="data" :index="phaseIndex" />
                            </v-col>
                          </v-row>

                          <v-row>
                            <features-selector
                              :phase="phase"
                              :episode-id="episodeId"
                              :data="data"
                            />
                          </v-row>

                          <topics-selector
                            :phase="phase"
                            :episode-id="episodeId"
                            :whitelist="phase.topic_whitelist"
                          />
                        </v-container>
                      </v-col>
                    </v-row>

                    <v-btn
                      fab
                      size="12"
                      color="green"
                      class="content-editor-draggable-add"
                      @click="addPhase({ after: phase, data })"
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
                :may-commit="mayCommitEpisodeSpecs"
                commit-message-ext="to enable editing execution details"
                :loading="isCommittingEpisodeSpecs"
                @commit="commitEpisodeSpecs"
              />
            </container>
          </episode-tab>
        </v-tab-item>

        <!-- =============================================================================== -->
        <!-- MESSAGE FLOW TAB -->
        <!-- =============================================================================== -->

        <v-tab-item class="content-editor-messages">
          <episode-tab
            :episode="data.story_chapter_by_pk"
            detail="narrative"
            tab="message-flow"
            @goto-episode-specs="activateSpecsTab"
          />
        </v-tab-item>

        <!-- =============================================================================== -->
        <!-- CHATBOT INTERACTIONS TAB -->
        <!-- =============================================================================== -->

        <v-tab-item class="content-editor-interactions">
          <episode-tab
            :episode="data.story_chapter_by_pk"
            detail="chatbot"
            tab="chatbot-interactions"
            @goto-episode-specs="activateSpecsTab"
          />
        </v-tab-item>

        <!-- =============================================================================== -->
        <!-- MATH CHALLENGE TAB -->
        <!-- =============================================================================== -->

        <v-tab-item class="content-editor-challenge">
          <episode-tab
            :episode="data.story_chapter_by_pk"
            detail="math"
            tab="math-challenge"
            @goto-episode-specs="activateSpecsTab"
          >
            Episode challenge for "{{ data.story_chapter_by_pk.title }}"
          </episode-tab>
        </v-tab-item>

        <!-- =============================================================================== -->
        <!-- TESTS & FEEDBACK TAB -->
        <!-- =============================================================================== -->

        <v-tab-item class="content-editor-feedback">
          <episode-tab
            :episode="data.story_chapter_by_pk"
            detail="feedback"
            tab="test-and-feedback"
            @goto-episode-specs="activateSpecsTab"
          />
        </v-tab-item>

        <!-- =============================================================================== -->
        <!-- META TAB -->
        <!-- =============================================================================== -->

        <v-tab-item class="content-editor-meta">
          <v-text-field
            label="Episode Title"
            :value="data.story_chapter_by_pk.title"
            @change="
              edit(
                'episode',
                episodeId,
                'title',
                $event,
                data.story_chapter_by_pk.edit
              )
            "
          />

          <v-text-field
            label="Promises"
            :value="data.story_chapter_by_pk.edit.promises || ''"
            @change="
              $apollo.mutate({
                mutation: require('~/graphql/UpdateEpisodePromises'),
                variables: {
                  id: episodeId,
                  promises: [$event],
                },
              })
            "
          />
        </v-tab-item>
      </v-tabs-items>

      <specs-have-changed-warning
        v-if="
          data.story_chapter_by_pk.story.edit.state !== 'specs' &&
            data.story_chapter_by_pk.edit.warnStorySpecsHaveChanged
        "
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
    Draggable,
  },
  asyncData({ route }) {
    const tab = route.query.t || 0
    return { tab }
  },
  data: () => ({
    isCommittingEpisodeSpecs: false,
    isCommittingMessageFlow: false,
    countRefreshEpisode: 0,
    enableRefreshEpisode: true,
  }),
  head() {
    return {
      title: 'Episode View', // TODO: One day, move apollo query into <script> to make it accessible from here and change title to sth like "Episode 1"
    }
  },
  computed: {
    storyId() {
      return this.$route.params.story
    },
    episodeId() {
      return this.$route.params.episode
    },
    privileges() {
      const priv = this.$store.state.user.privileges
      return priv ? priv[this.storyId] : []
    },
    mayCommitEpisodeSpecs() {
      return this.privileges && this.privileges.includes('CommitEpisodeSpecs')
    },
    mayCommitMessageFlow() {
      return this.privileges && this.privileges.includes('CommitEpisodeSpecs')
    },
  },
  watch: {
    countRefreshEpisode() {
      this.enableRefreshEpisode = false
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        this.enableRefreshEpisode = true
      }, 1000)
    },
  },
  methods: {
    addTabToURL(index) {
      console.log('Called addTabToURL ', index)
      const query = this.$route.query
      if (index !== query.t) {
        this.$router.replace({
          ...this.$route,
          query: {
            ...query,
            t: index,
          },
        })
      }
    },
    refreshEpisode(previousResult, { subscriptionData }) {
      if (previousResult) {
        console.log('refreshEpisode', { previousResult, subscriptionData })
        this.countRefreshEpisode += 1
        const newQueryResult = subscriptionData.data.story_chapter_by_pk
        const newPhases = newQueryResult.sections
        const newEpisode = {
          story_chapter_by_pk: {
            id: previousResult.story_chapter_by_pk.id,
            ...newQueryResult,
          },
        }
        newEpisode.story_chapter_by_pk.story.edit.state = newQueryResult.story.edit.state
        newEpisode.story_chapter_by_pk.sections = JSON.parse(JSON.stringify(newPhases))
        return newEpisode
      }
    },
    refreshEpisodeMessages(previousResult, { subscriptionData }) {
      if (previousResult) {
        console.log('refreshEpisodeMessages', { previousResult, subscriptionData })
        const newQueryResult = subscriptionData.data.story_chapter_by_pk
        const newPhases = [...newQueryResult.sections]
        const newEpisodeMsgs = {
          story_chapter_by_pk: {
            id: previousResult.story_chapter_by_pk.id,
            ...newQueryResult,
          },
        }
        newEpisodeMsgs.story_chapter_by_pk.sections = JSON.parse(JSON.stringify(newPhases))
        return newEpisodeMsgs
      }
    },
    updateEpisodeEditStateToSpecsIfNull(editField) {
      if (!('state' in editField)) {
        this.$apollo.mutate({
          mutation: require('~/graphql/UpdateEpisodeEditState'),
          variables: {
            id: this.episodeId,
            state: 'specs',
          },
        })
      }
    },
    async addPhase({ after, duplicate = false, data }) {
      this.updateEpisodeEditStateToSpecsIfNull(data.story_chapter_by_pk.edit)
      const number = after.number ? after.number + 1 : 1
      const fakeId = 'zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzz'
      const variables = {
        episodeId: this.episodeId,
        number,
        topic_whitelist: [...after.topic_whitelist],
      }
      const idxClone = after.number ? after.number - 1 : 0
      const cloneData = data.story_chapter_by_pk.sections[idxClone]
      if (duplicate) {
        Object.assign(variables, {
          title: after.title,
          specs: after.specs,
        })
        data.story_chapter_by_pk.sections.splice(number - 1, 0, {
          ...cloneData,
          id: fakeId,
        })
        variables.meta = JSON.parse(JSON.stringify(after.meta))
      } else {
        data.story_chapter_by_pk.sections.splice(number - 1, 0, {
          ...cloneData,
          id: fakeId,
          title: '',
          specs: '',
          topic_whitelist: [],
          number,
          prompts: [],
          meta: { mood: {}, topics: [], features: [], challenges: [] },
        })
      }
      const request = await this.$db.add({ phase: { message: true } }, 'episode', after, variables, this.episodeId)
      console.log('mutation AddPhase returned', request.data)
    },
    deletePhase(phase, data) {
      if (confirm('Are you sure you want to delete phase ' + phase.number + ', "' + phase.title + '"?')) {
        this.updateEpisodeEditStateToSpecsIfNull(data.story_chapter_by_pk.edit)

        // Update UI optimistically ...
        let index = 0
        data.story_chapter_by_pk.sections.every((section, idx) => {
          index = idx
          if (section.id === phase.id) {
            return false
          }
          return true
        })
        data.story_chapter_by_pk.sections.splice(index, 1)
        const apolloClient = this.$apollo.provider.defaultClient
        apolloClient.writeQuery({
          query: require('~/graphql/GetEpisode'),
          data,
        })
        // ... and perform the changes in the DB
        this.$db.delete({ phase: { message: true } }, 'episode', phase, this.episodeId)
      }
    },
    ...mapMutations('autosave', [
      'pushChange',
    ]),
    edit(what, id, element, value, editField) {
      this.updateEpisodeEditStateToSpecsIfNull(editField)
      const capital = s => s.substr(0, 1).toUpperCase() + s.substr(1)
      const variables = { id }
      variables[element] = value
      this.pushChange({
        change: {
          mutation: require('~/graphql/Update' + capital(what) + capital(element)),
          variables,
        },
        dispatch: this.$store.dispatch,
      })
    },
    async commitEpisodeSpecs() {
      this.isCommittingEpisodeSpecs = true
      await this.$apollo.mutate({
        mutation: require('~/graphql/EnterEpisodeDetailsExecution'),
        variables: {
          id: this.episodeId,
        },
      })
      this.isCommittingEpisodeSpecs = false
    },
    closeStorySpecsHaveChangedWarning() {
      this.$apollo.mutate({
        mutation: require('~/graphql/UpdateEpisodeEditWarnStorySpecsHaveChanged'),
        variables: {
          id: this.episodeId,
          warnStorySpecsHaveChanged: false,
        },
      })
    },
    activateSpecsTab() {
      this.tab = 0
      this.addTabToURL(0)
    },
    applyDrag(arr, { removedIndex, addedIndex, payload }) {
      const result = [...arr]
      let itemToAdd = payload
      if (removedIndex !== null) {
        const fromNumber = removedIndex + 1
        const toNumber = addedIndex + 1
        for (const item of result) {
          if (item.number > fromNumber && item.number <= toNumber) {
            item.number -= 1
          }
          if (item.number >= toNumber && item.number < fromNumber) {
            item.number += 1
          }
        }
        itemToAdd = result.splice(removedIndex, 1)[0]
      }
      if (addedIndex !== null) {
        itemToAdd.number = addedIndex + 1
        result.splice(addedIndex, 0, itemToAdd)
      }
      return result
    },
    async onDrop({ removedIndex, addedIndex, payload }, data) {
      if (removedIndex !== addedIndex) {
        const result = this.applyDrag(
          data.story_chapter_by_pk.sections,
          { removedIndex, addedIndex, payload }
        )
        data.story_chapter_by_pk.sections = result
        const from = removedIndex + 1
        const to = addedIndex + 1

        await this.$apollo.mutate({
          mutation: require('~/graphql/MovePhase'),
          variables: {
            id: payload.phaseId,
            episodeId: this.episodeId,
            from,
            to,
          },
        })
      }
    },
  },
}
</script>
