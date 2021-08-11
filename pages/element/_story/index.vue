<template lang="html">
  <div class="content-editor">
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
        <v-btn
          v-if="episodes.length === 0"
          fab
          size="12"
          color="green"
          @click="addEpisode({after: {id: story + '/'}})"
        >
          <v-icon color="white">
            mdi-plus
          </v-icon>
        </v-btn>

        <container
          v-else
          group-name="story-specs"
          drag-handle-selector=".content-editor-draggable-handle"
          @drop="onDrop"
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
                    <v-icon
                      class="content-editor-draggable-handle"
                    >
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
                        autofocus
                        full-width
                        rows="1"
                        auto-grow
                        :prefix="`E.${i+1}: `"
                        background-color="white"
                        label="Enter a title for this episode"
                        @input="changeEpisode({id: episode.id, element: 'title', to: $event})"
                      >
                        <template #append>
                          <v-tooltip bottom>
                            <template #activator="{on, attrs}">
                              <v-hover v-slot="{ hover }">
                                <v-icon
                                  v-bind="attrs"
                                  :color="hover ? 'purple' : 'grey lighten-2'"
                                  v-on="on"
                                  @click="$router.push(`/element/${episode.id}`)"
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
                                  @click="addEpisode({after: episode, duplicate: true})"
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
                            v-if="episodes.length > 1"
                            bottom
                          >
                            <template #activator="{on, attrs}">
                              <v-hover v-slot="{ hover }">
                                <v-icon
                                  v-bind="attrs"
                                  class="ml-2"
                                  :color="hover ? 'red' : 'grey lighten-2'"
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
                        @input="changeEpisode({id: episode.id, element: 'specs', to: $event})"
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
                            :phase="episode.phases[0]"
                            :npc="character"
                          />
                        </v-col>
                      </v-row>

                      <v-row>
                        <features-selector
                          :phase="episode.phases[0]"
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
                  @click="addEpisode({after: episode})"
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
        <h4>Story Meta</h4>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import { Container, Draggable } from 'vue-smooth-dnd'
import { mapMutations } from 'vuex'

export default {
  components: {
    Container,
    Draggable
  },
  // async asyncData ({ $axios, params }) {
  //   const prompts = (
  //     await $axios.$get('prompts', {
  //       params: {
  //         chapter: params.slug
  //       }
  //     })
  //   ).prompts
  //
  //   const promptHasChanged = Array(prompts.length).fill(false)
  //
  //   return {
  //     prompts,
  //     promptHasChanged
  //   }
  // },
  data: () => ({
    //   return {
    //     accessGranted: false,
    //     password: '',
    //     showAccessDeniedAlert: false,
    //     autosaveInterval: 30000,
    tab: 0
  //     nlp: null,
  //     intent: '',
  //     response: '',
  //     intentHasChanged: {},
  //     responseHasChanged: {},
  }),
  computed: {
    story () {
      return this.$route.params.story
    },
    storyInfo () {
      return this.$store.state.stories.find(s => s.id === this.story)
    },
    episodes: {
      get () {
        return this.storyInfo ? this.storyInfo.episodes : []
      },
      set (v) {
        if (this.storyInfo) {
          this.storyInfo.episodes = v
        }
      }
    }
  //   npc() {
  //     return this.npcData[this.currentNPC]
  //   },
  //   page() {
  //     return this.content.page
  //   },
  //   meta() {
  //     return this.content.meta
  //   },
  },
  // mounted () {
  //   setInterval(() => {
  //     this.saveChanges()
  //   }, this.autosaveInterval)
  // },
  // unmount () {
  //   this.saveChanges()
  // },
  methods: {
    ...mapMutations([
      'moveEpisode',
      'changeEpisode',
      'addEpisode',
      'deleteEpisode'
    ]),
    onDrop ({ removedIndex, addedIndex }) {
      this.moveEpisode({
        story: this.story,
        fromIndex: removedIndex,
        toIndex: addedIndex
      })
    },
    //   checkAccess() {
    //     if (this.password === '8lgebr81') {
    //       this.accessGranted = true
    //     } else {
    //       this.showAccessDeniedAlert = true
    //     }
    //   },
    //   passwordKeydown(e) {
    //     this.showAccessDeniedAlert = false
    //     if (e.keyCode === 13) {
    //       e.preventDefault()
    //       e.stopPropagation()
    //       this.checkAccess()
    //     }
    //   },
    //   async selectNPC(newNPC) {
    //     if (this.currentNPC === newNPC) { return }
    //     if (this.currentNPC !== '') {
    //       await this.saveChanges()
    //     }
    //     this.currentNPC = ''
    //     this.nlp = null
    //
    //     const nlp = await this.$axios.$get('courses/algebra1/nlp', {
    //       params: {
    //         npc: newNPC,
    //       },
    //     })
    //
    //     this.intentHasChanged = Object.fromEntries(
    //       Object.keys(nlp.intents)
    //         .map(k => [k, false])
    //     )
    //     this.responseHasChanged = Object.fromEntries(
    //       Object.keys(nlp.responses)
    //         .map(k => [k, false])
    //     )
    //     this.currentNPC = newNPC
    //     this.nlp = nlp
    //   },
    saveChanges () {
      this.promptHasChanged
        .forEach(async (hasChanged, i) => {
          if (hasChanged) {
            this.promptHasChanged[i] = false
            await this.$axios.post('prompts', this.prompts[i], {
              params: {
                chapter: this.$route.params.story,
                id: i
              }
            })
          }
        })
      //
      //     if (this.nlp) {
      //       Object.keys(this.nlp.intents)
      //         .filter(i => this.intentHasChanged[i])
      //         .forEach(async (i) => {
      //           await this.$axios.post('courses/algebra1/nlp/intents', {
      //             intent: i,
      //             examples: this.nlp.intents[i],
      //           }, {
      //             params: {
      //               npc: this.currentNPC,
      //             },
      //           })
      //           this.intentHasChanged[i] = false
      //         })
      //
      //       Object.keys(this.nlp.responses)
      //         .filter(i => this.responseHasChanged[i])
      //         .forEach(async (i) => {
      //           await this.$axios.post('courses/algebra1/nlp/responses', {
      //             response: i,
      //             examples: this.nlp.responses[i],
      //           }, {
      //             params: {
      //               npc: this.currentNPC,
      //             },
      //           })
      //           this.responseHasChanged[i] = false
      //         })
      //     }
    },
    addPrompt (at) {
      const emptyPrompt = {
        who: 'unknown',
        type: 'text',
        msg: '',
        comment: ''
      }
      this.prompts.splice(at, 0, emptyPrompt)
      this.promptHasChanged.splice(at, 0, true)
      for (let i = at + 1; i < this.prompts.length; i++) {
        this.promptHasChanged[i] = true
      }
      this.saveChanges()
    },
    async deletePrompt (at) {
      this.prompts.splice(at, 1)
      this.promptHasChanged.splice(at, 1)
      await this.$axios.delete('prompts', {
        params: {
          chapter: this.$route.params.story,
          id: at
        }
      })
    },
    promptAction (actionType, promptIndex) {
      switch (actionType) {
        case 'insertAbove':
          this.addPrompt(promptIndex)
          break
        case 'insertBelow':
          this.addPrompt(promptIndex + 1)
          break
        case 'split':
          {
            const ta = document
              .getElementsByClassName('prompt-body')[promptIndex]
              .getElementsByTagName('textarea')[0]
            const pos = ta.selectionStart
            if (pos === ta.selectionEnd) {
              this.addPrompt(promptIndex + 1)
              this.prompts[promptIndex + 1].who = this.prompts[promptIndex].who
              this.prompts[promptIndex + 1].type = this.prompts[promptIndex].type

              const origMsg = this.prompts[promptIndex].msg
              this.prompts[promptIndex].msg = origMsg.substring(0, pos).trim()
              this.prompts[promptIndex + 1].msg = origMsg.substring(pos).trim()
              setTimeout(() => {
                document
                  .getElementsByClassName('prompt-body')[promptIndex + 1]
                  .getElementsByTagName('textarea')[0]
                  .focus()
              }, 300)
            }
          }
          break
        case 'merge':
          this.prompts[promptIndex].msg = this.prompts[promptIndex].msg.trim() +
                                    ' ' + this.prompts[promptIndex + 1].msg.trim()
          this.deletePrompt(promptIndex + 1)
          break
        case 'delete':
          this.deletePrompt(promptIndex)
          break
      }
    }
  //   async deleteIntent() {
  //     this.intents.splice(this.intents.indexOf(this.intent), 1)
  //     delete this.exampleMessages[this.intent]
  //     await this.$axios.delete('courses/algebra1/nlp/intents', {
  //       params: {
  //         intent: this.intent.replace(/\s/g, '_'),
  //       },
  //     })
  //   },
  }
}
</script>

<style lang="sass">
</style>
