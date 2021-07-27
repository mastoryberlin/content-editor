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
        <Container
          group-name="story-specs"
          drag-handle-selector=".content-editor-draggable-handle"
          @drop="onDrop"
        >
          <Draggable v-for="(episode, i) in episodes" :key="i">
            <v-sheet
              elevation="2"
              rounded
              class="ma-4 pa-3 content-editor-draggable"
            >
              <v-container fluid>
                <div class="content-editor-draggable-sidebar">
                  <v-icon
                    class="content-editor-draggable-handle"
                  >
                    mdi-drag
                  </v-icon>
                </div>

                <div class="content-editor-draggable-content">
                  <div class="content-editor-draggable-title">
                    <v-text-field
                      v-model="episode.title"
                      class="text-h4"
                      filled
                      rounded
                      :prefix="`Episode ${i+1}: `"
                      grow
                      background-color="white"
                    >
                      <template #append-outer>
                        <v-hover v-slot="{ hover }">
                          <v-icon
                            class="ml-2"
                            :color="hover ? 'blue' : 'grey lighten-2'"
                          >
                            mdi-content-duplicate
                          </v-icon>
                        </v-hover>

                        <v-hover v-slot="{ hover }">
                          <v-icon
                            class="ml-2"
                            :color="hover ? 'red' : 'grey lighten-2'"
                          >
                            mdi-delete
                          </v-icon>
                        </v-hover>
                      </template>
                    </v-text-field>
                  </div>

                  <div class="content-editor-draggable-specs">
                    <v-textarea
                      v-model="episode.specs"
                      full-width
                      outlined
                      auto-grow
                      rows="2"
                    />
                  </div>

                  <v-btn
                    fab
                    size="12"
                    color="green"
                    class="content-editor-draggable-add"
                  >
                    <v-icon color="white">
                      mdi-plus
                    </v-icon>
                  </v-btn>
                </div>
              </v-container>
            </v-sheet>
          </Draggable>
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
    tab: 0,
    episodes: [
      {
        title: 'Title 1',
        specs: 'Specs for Episode 1'
      },
      {
        title: 'Title 2',
        specs: 'Specs for Episode 2'
      },
      {
        title: 'Title 3',
        specs: 'Specs for Episode 3'
      },
      {
        title: 'Title 4',
        specs: 'Specs for Episode 4'
      },
      {
        title: 'Title 5',
        specs: 'Specs for Episode 5'
      }
    ]
  //     currentNPC: '',
  //     npcSpeedDial: false,
  //     npcData: {
  //       prof: {
  //         name: 'Mr Camarena',
  //         img: '/test/professor1.jpg',
  //       },
  //       alicia: {
  //         name: 'Alicia',
  //         img: '/test/alicia.png',
  //       },
  //       vz: {
  //         name: 'VZ',
  //         img: '/test/vz.png',
  //       },
  //       nick: {
  //         name: 'Nick',
  //         img: '/test/nick.png',
  //       },
  //     },
  //     nlp: null,
  //     intent: '',
  //     response: '',
  //     intentHasChanged: {},
  //     responseHasChanged: {},
  //     content: {
  //       meta: {
  //         title: 'Content Editor - Algebra 1',
  //       },
  //       page: {
  //         intro: {
  //           header: 'Algebra 1',
  //         },
  //       },
  //     },
  //   }
  }),
  // computed: {
  //   npc() {
  //     return this.npcData[this.currentNPC]
  //   },
  //   page() {
  //     return this.content.page
  //   },
  //   meta() {
  //     return this.content.meta
  //   },
  // },
  // mounted () {
  //   setInterval(() => {
  //     this.saveChanges()
  //   }, this.autosaveInterval)
  // },
  // unmount () {
  //   this.saveChanges()
  // },
  methods: {
    onDrop ({ removedIndex, addedIndex }) {
      const draggedItem = this.episodes[removedIndex]
      const newItems = [...this.episodes]
      newItems.splice(removedIndex, 1)
      newItems.splice(addedIndex, 0, draggedItem)
      this.episodes = newItems
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

<style lang="sass" scoped>
.content
  &-editor
    padding: 5px
    &-draggable
      position: relative
      &-sidebar
        display: inline-block
        margin-right: 5px
      &-content
        display: inline-block
        width: 100%
      &-title
        display: inline-block
      &-specs
        display: inline-block
        width: 100%
      &-add
        position: absolute
        bottom: -24px
        right: 24px
    &-prompts
      display: inline
      &-buttons
        text-align: center
    &-interactions
      &-npc
        display: inline
</style>
