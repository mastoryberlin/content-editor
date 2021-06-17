<template lang="html">
  <div class="algebra1">
    <v-tabs v-model="tab" grow>
      <v-tab>
        Storyline
      </v-tab>
      <v-tab>
        Chatbot Interactions
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab" class="algebra1-editor">
      <v-tab-item class="algebra1-editor-prompts">
        <m-prompt
          v-for="(prompt, i) in prompts"
          :key="i"
          :prompt="prompt"
          @change="promptHasChanged[i] = true"
          @action="promptAction($event, i)"
        />
        <div class="algebra1-editor-prompts-buttons">
          <v-btn
            class="mx-2"
            fab
            dark
            color="green"
            @click="addPrompt(prompts.length)"
          >
            <v-icon dark>
              mdi-plus
            </v-icon>
          </v-btn>
        </div>
      </v-tab-item>

      <v-tab-item class="algebra1-editor-interactions">
      <!--     <div class="text-center">
            <h5 class="algebra1-editor-interactions-section-header" v-text="'NPC chatbot'" />
            <p>
              Select here which NPC to train:
              <v-speed-dial
                v-model="npcSpeedDial"
                class="algebra1-editor-interactions-npc"
                direction="right"
                transition="scale-transition"
              >
                <template #activator>
                  <v-btn
                    v-model="npcSpeedDial"
                    class="algebra1-editor-interactions-npc-button"
                    fab
                  >
                    <v-avatar>
                      <template v-if="currentNPC === ''">
                        ?
                      </template>
                      <img v-else :src="npc.img" :alt="npc.name">
                    </v-avatar>
                  </v-btn>
                </template>
                <v-btn
                  v-for="who in Object.keys(npcData).filter(k => k != currentNPC)"
                  :key="who"
                  fab
                  @click="selectNPC(who)"
                >
                  <v-avatar>
                    <img :src="npcData[who].img" :alt="npcData[who].name">
                  </v-avatar>
                </v-btn>
              </v-speed-dial>
            </p>
          </div>

          <v-container v-if="nlp !== null">
            <v-row>
              <v-col
                cols="12"
                xs="12"
                sm="12"
                md="6"
              >
                <m-chatbot-training-data-editor
                  v-model="nlp.intents"
                  :category="{
                    header: 'Student intents',
                    name: 'intent',
                    intro: 'We need to group messages that we expect students to post into <em>intents</em>.',
                    selector: 'A student could have the intent to ...',
                  }"
                  :examples="{
                    header: 'Example messages',
                    intro: `With the intent to <strong>${intent}</strong>, the student might write one of these messages:`,
                    backgroundColor: '#aeddff',
                  }"
                  @changeCategory="intent = $event"
                  @updateCategory="intentHasChanged[$event] = true"
                />
              </v-col>

              <v-col
                cols="12"
                xs="12"
                sm="12"
                md="6"
              >
                <m-chatbot-training-data-editor
                  v-if="intent in nlp.intents"
                  v-model="nlp.responses"
                  :category="{
                    header: npc.name + '’s responses',
                    name: 'response',
                    intro: 'Similarly, we group the messages that NPCs send in reaction to the student into <em>responses</em>.',
                    selector: `In response to the students’ intent to <strong>${intent}</strong>, ${npc.name} should`,
                  }"
                  :examples="{
                    header: 'Return messages',
                    intro: `In order to <strong>${response}</strong>, ${npc.name} can send one of these messages:`,
                    backgroundColor: 'amber lighten-4',
                  }"
                  @changeCategory="response = $event"
                  @updateCategory="responseHasChanged[$event] = true"
                />
              </v-col>
            </v-row>
          </v-container> -->
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
// import editor from 'vue-tinymce-editor'
// import { gql } from 'nuxt-graphql-request'

export default {
  components: {
    // editor,
  },
  async asyncData ({ $axios, params }) {
    const prompts = (
      await $axios.$get('prompts', {
        params: {
          chapter: params.slug
        }
      })
    ).prompts

    const promptHasChanged = Array(prompts.length).fill(false)

    return {
      prompts,
      promptHasChanged
    }
  },
  data: () => ({
    //   return {
    //     accessGranted: false,
    //     password: '',
    //     showAccessDeniedAlert: false,
    //     autosaveInterval: 30000,
    tab: 0
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
  mounted () {
    setInterval(() => {
      this.saveChanges()
    }, this.autosaveInterval)
  },
  unmount () {
    this.saveChanges()
  },
  methods: {
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
                chapter: this.$route.params.slug,
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
          chapter: this.$route.params.slug,
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
.algebra1
  &-editor
    padding: 5px
    &-prompts
      display: inline
      &-buttons
        text-align: center
    &-interactions
      &-npc
        display: inline
</style>
