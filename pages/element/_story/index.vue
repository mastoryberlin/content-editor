<template>
  <div>
    <privileged-area v-if="story" needs="edit_episode_specs" to="edit">
      <v-tabs v-model="tab">
        <v-tab v-text="'Specs'" />
        <v-tab v-text="'Meta'" />
        <v-tab v-if="isSuperAdmin" v-text="'Alpha Test'" />
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item class="content-editor-specs pa-2">
          <v-overlay absolute :value="story.edit.state === 'episodes'">
            <p>
              We are currently editing <strong>individual episodes</strong> of
              "{{ title }}".
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
            Enter here the story specs for “{{ title }}” by adding a new card
            for each episode.
          </p>

          <template v-if="showFreeflow">
            <p>
              You can also write the specs into this free-flow input field and
              click one of the options below it to generate episode cards for
              each paragraph.
              <a @click.stop.prevent="showFreeflow = false">Hide</a>
            </p>

            <freeflow-specs-field
              scope="story"
              field="description"
              :data-object="story"
              :ref-id="storyId"
              @generate-specs="generateSpecsFromFreeflow"
            />
          </template>

          <p v-else>
            Click <a @click.stop.prevent="showFreeflow = true">here</a>
            if you prefer to write the story specs in a free-flow format at
            first.
          </p>

          <container
            group-name="story-specs"
            drag-handle-selector=".content-editor-draggable-handle"
            :get-child-payload="(index) => ({ episodeId: episodes[index].id })"
            @drop="onDrop($event)"
          >
            <draggable v-for="(episode, i) in episodes" :key="i">
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
                          :value="episode.title"
                          class="text-h5"
                          filled
                          rounded
                          full-width
                          rows="1"
                          auto-grow
                          :prefix="`E.${episode.number}: `"
                          background-color="white"
                          label="Enter a title for this episode"
                          :disabled="!!episode.editedBy"
                          @focus="startEditing(episode, 'title')"
                          @blur="stopEditing"
                          @change="editEpisodeTitle(episode, $event)"
                        >
                          <template #append>
                            <v-tooltip bottom>
                              <template #activator="{ on, attrs }">
                                <v-hover v-slot="{ hover }">
                                  <v-icon
                                    v-bind="attrs"
                                    :color="hover ? 'purple' : 'grey lighten-2'"
                                    v-on="on"
                                    @click="
                                      $router.push(
                                        `/element/${storyId}/${episode.id}`
                                      )
                                    "
                                  >
                                    mdi-open-in-new
                                  </v-icon>
                                </v-hover>
                              </template>
                              <span> Edit episode details </span>
                            </v-tooltip>
                          </template>

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
                                      addEpisode({
                                        after: episode,
                                        duplicate: true,
                                      })
                                    "
                                  >
                                    mdi-content-duplicate
                                  </v-icon>
                                </v-hover>
                              </template>
                              <span> Duplicate </span>
                            </v-tooltip>

                            <v-tooltip v-if="episodes.length > 1" bottom>
                              <template #activator="{ on, attrs }">
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
                              <span> Delete </span>
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
                          @change="editEpisodeSpecs(episode, $event)"
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
                            <mood-selector
                              :phase="episode.sections[0]"
                              :npc="character"
                            />
                          </v-col>
                        </v-row>

                        <v-row>
                          <features-selector
                            :phase="episode.sections[0]"
                            :data="story"
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

          <finish-work-btn tab-type="story-specs" button-type="commit" />
        </v-tab-item>

        <v-tab-item class="content-editor-meta">
          <v-text-field
            label="Story Title"
            :value="title"
            @change="
              $apollo.mutate({
                mutation: require('~/graphql/UpdateStoryTitle'),
                variables: { id: storyId, title: $event },
              })
            "
          />
          <v-text-field
            label="Story Description"
            :value="description"
            @change="
              $apollo.mutate({
                mutation: require('~/graphql/UpdateStoryDescription'),
                variables: { id: storyId, description: $event },
              })
            "
          />
          <v-btn color="error" :disabled="!isSuperAdmin" @click="deleteStory">
            Delete Story
          </v-btn>
        </v-tab-item>
        <v-tab-item v-if="isSuperAdmin" class="content-editor-alpha-test">
          <alpha-test />
        </v-tab-item>
      </v-tabs-items>
    </privileged-area>
  </div>
</template>

<script>
import { Container, Draggable } from 'vue-smooth-dnd'
import { mapActions, mapMutations } from 'vuex'

export default {
  components: {
    Container,
    Draggable,
  },
  data: () => ({
    tab: 0,
    noUpdatesFrom: { id: null, field: null },
    showFreeflow: false,
    isCommittingStorySpecs: false,
    isReopeningStorySpecs: false,
    story: null,
  }),
  apollo: {
    story: {
      query: require('~/graphql/GetStory'),
      variables() {
        return { id: this.storyId }
      },
      update: data => data.story_by_pk,
      subscribeToMore: {
        document: require('~/graphql/RefreshStory'),
        variables() {
          return { id: this.storyId }
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          const newResult = { ...previousResult }
          newResult.story_by_pk = JSON.parse(JSON.stringify(subscriptionData.data.story_by_pk))
          return newResult
        },
      },
    },
  },
  head: {
    title: 'Story View',
  },
  computed: {
    storyId() {
      return this.$route.params.story
    },
    title() {
      return this.story.title
    },
    description() {
      return this.story.description
    },
    episodes() {
      return this.story.chapters
    },
    privileges() {
      const priv = this.$store.state.user.privileges
      if (!priv) {
        this.$store.dispatch('user/queryPrivileges')
      }
      return priv ? priv[this.storyId] : []
    },
    isSuperAdmin() {
      const priv = this.$store.state.user.privileges
      return priv ? !!priv.superadmin : false
    },
    mayCommit() {
      return this.privileges && this.privileges.includes('CommitStorySpecs')
    },
  },
  methods: {
    deleteStory() {
      if (confirm('Are you sure you want to delete this story?')) {
        // TODO: don't need parentId
        const hierarchyData = {
          story: {
            episode: {
              phase: { message: true },
              challenge: { worksheet: true },
              survey: { question: true },
            },
          },
        }
        this.$db.delete(hierarchyData, null, { id: this.storyId }, null)
      }
    },
    generateSpecsFromFreeflow(text) {
      console.log(text)
    },
    startEditing(element, field) {
      this.noUpdatesFrom = {
        id: element ? element.id : null,
        field,
      }
      console.log('startEditing', this.noUpdatesFrom)
    },
    stopEditing() {
      this.noUpdatesFrom = null
    },
    editEpisodeTitle(episode, title) {
      this.pushChange({
        change: {
          mutation: require('~/graphql/UpdateEpisodeTitle'),
          variables: { id: episode.id, title },
        },
        dispatch: this.$store.dispatch,
      })
      if (episode.edit) {
        const shortcutStoryID = episode.edit.shortcutStoryID
        if (shortcutStoryID) {
          this.$shortcut.updateStory(shortcutStoryID, {
            name: 'Episode ' + episode.number + ': ' + title,
          })
        }
      }
    },
    editEpisodeSpecs(episode, specs) {
      this.pushChange({
        change: {
          mutation: require('~/graphql/UpdateEpisodeSpecs'),
          variables: { id: episode.id, specs },
        },
        dispatch: this.$store.dispatch,
      })
      if (episode.edit) {
        const shortcutStoryID = episode.edit.shortcutStoryID
        if (shortcutStoryID) {
          this.$shortcut.updateStory(shortcutStoryID, {
            description: specs,
          })
        }
      }
    },

    // Handle subscription updates
    // refreshStory(previousResult, { subscriptionData }) {
    //   console.log('refreshStory', { previousResult, subscriptionData })
    //   const previous = previousResult.story_by_pk
    //   const updated = subscriptionData.data.story_by_pk
    //   if (this.noUpdatesFrom) {
    //     const { id, field } = this.noUpdatesFrom
    //     if (id) {
    //       // some episode is being edited
    //       const eps = updated.chapters
    //       const ep = eps.find(e => e.id === id)
    //       const index = eps.indexOf(ep)
    //       eps[index] = JSON.parse(JSON.stringify(previous.chapters[index]))
    //     } else {
    //       // story's top level properties are being edited
    //       delete updated[field]
    //     }
    //   }
    //   const newStory = {
    //     story_by_pk: {
    //       id: previous.id,
    //       ...updated,
    //     },
    //   }
    //   newStory.story_by_pk.chapters = JSON.parse(JSON.stringify(updated.chapters))
    //   newStory.story_by_pk.edit.state = updated.edit.state
    //   console.log('returning', newStory)
    //   return newStory
    // },

    async addEpisode({ after, duplicate = false }) {
      const editField = this.story.edit
      const number = after.number ? after.number + 1 : 1
      const fakeId = 'zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzz'
      const fakeSections = {
        episodeId: fakeId,
        number: 1,
        meta: JSON.parse(JSON.stringify(after.sections[after.sections.length - 1].meta)),
      }
      const variables = {
        storyId: this.storyId,
        number,
      }
      if (duplicate) {
        Object.assign(variables, {
          title: after.title,
          description: after.description,
          specs: after.specs,
        })
        this.story.chapters.splice(number - 1, 0, {
          ...after,
          id: fakeId,
          number,
          sections: [fakeSections],
        })
      } else {
        this.story.chapters.splice(number - 1, 0, {
          edit: after.edit,
          id: fakeId,
          number,
          title: '',
          specs: '',
          sections: [fakeSections],
        })
      }
      // Optimistic sidebar
      const apolloClient = this.$apollo.provider.defaultClient
      const getStories = apolloClient.readQuery({
        query: require('~/graphql/GetStories'),
      })
      getStories.story[0].chapters.splice(number - 1, 0, {
        edit: after.edit,
        id: fakeId,
        story: {
          id: fakeId,
        },
        title: duplicate ? after.title : '',
      })
      const shortcut = editField.shortcut
      if (shortcut) {
        const { id } = await this.$shortcut.createStory({ name: 'Episode ' + number, project_id: shortcut.project, epic_id: shortcut.epic })
        variables.edit = {
          shortcutStoryID: id, state: 'specs', warnStorySpecsHaveChanged: false, warnEpisodeSpecsHaveChanged: false,
        }
      }
      await this.$db.add({ episode: { phase: { message: true } } }, 'story', null, variables, this.storyId)
    },
    deleteEpisode(episode) {
      // Optimistic
      let index = 0
      this.story.chapters.every((chapter, idx) => {
        index = idx
        if (chapter.id === episode.id) {
          return false
        }
        return true
      })
      this.story.chapters.splice(index, 1)
      // Optimistic sidebar
      const apolloClient = this.$apollo.provider.defaultClient
      const getStories = apolloClient.readQuery({
        query: require('~/graphql/GetStories'),
      })
      getStories.story[0].chapters.splice(index, 1)

      const title = episode.title === '' ? '' : ', "' + episode.title + '"'
      if (confirm('Are you sure you want to delete episode ' + episode.number + title + '?')) {
        if (episode.edit) {
          const shortcutStoryID = episode.edit.shortcutStoryID
          if (shortcutStoryID) {
            try {
              this.$shortcut.deleteStory(shortcutStoryID)
            } catch (err) {}
          }
        }
        const hierarchyData = {
          episode: {
            phase: { message: true },
            challenge: { worksheet: true },
            survey: { question: true },
          },
        }
        this.$db.delete(hierarchyData, 'story', episode, this.storyId)
      }
    },

    applyDrag(getStory, getStories, { removedIndex, addedIndex, payload }) {
      const getStoryResult = [...getStory]
      const getStoriesResult = [...getStories]
      let getStoryToAdd = payload
      let getStoriesToAdd = payload
      if (removedIndex !== null) {
        getStoryToAdd = getStoryResult.splice(removedIndex, 1)[0]
        getStoriesToAdd = getStoriesResult.splice(removedIndex, 1)[0]
      }
      if (addedIndex !== null) {
        getStoryResult.splice(addedIndex, 0, getStoryToAdd)
        getStoriesResult.splice(addedIndex, 0, getStoriesToAdd)
      }
      return {
        getStoryResult,
        getStoriesResult,
      }
    },

    async onDrop({ removedIndex, addedIndex, payload }) {
      try {
        const apolloClient = this.$apollo.provider.defaultClient
        const getStories = apolloClient.readQuery({
          query: require('~/graphql/GetStories'),
        })

        if (removedIndex !== addedIndex) {
          // Optimistic
          const { getStoryResult, getStoriesResult } = this.applyDrag(
            this.story.chapters,
            getStories.story[0].chapters,
            { removedIndex, addedIndex, payload }
          )
          this.story.chapters = getStoryResult
          // Optimistic sidebar
          getStories.story[0].chapters = getStoriesResult

          const from = removedIndex + 1
          const to = addedIndex + 1
          console.log('dragdrop episode', from, to)
          await this.$apollo.mutate({
            mutation: require('~/graphql/MoveEpisode'),
            variables: {
              id: payload.episodeId,
              storyId: this.storyId,
              from,
              to,
            },
          })
        }
      } catch (error) {
        console.log(error)
      }
    },

    async commitStorySpecs(commitMessage) {
      this.isCommittingStorySpecs = true
      await this.$axios.post('https://' + process.env.NUXT_ENV_PROC_URL + '/content-editor/commit/story-specs', {
        storyId: this.storyId,
        commitMessage,
        pullRequest: !this.mayCommit,
      })
      await this.$apollo.mutate({
        mutation: require('~/graphql/UpdateStoryEditState'),
        variables: {
          id: this.storyId,
          state: this.mayCommit ? 'episodes' : 'specs-pr',
        },
      })
      this.isCommittingStorySpecs = false
    },

    async uncommitStorySpecs(currentState) {
      await this.$apollo.mutate({
        mutation: require('~/graphql/UpdateStoryEditState'),
        variables: {
          id: this.storyId,
          state: 'specs',
        },
      })
    },

    ...mapMutations('autosave', [
      'pushChange',
    ]),

    ...mapActions([
      'lock',
      'unlock',
    ]),
  },
}
</script>

<style lang="sass">
</style>
