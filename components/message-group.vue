<template>
  <draggable>
    <v-sheet
      elevation="2"
      rounded
      class="mx-4 my-8 pa-3 content-editor-draggable"
      :class="'content-editor-draggable-' + message.type + '-message-bg'"
    >
      <v-container>
        <v-row cols="12">
          <v-col v-if="deletable" class="content-editor-draggable-sidebar">
            <v-icon
              class="content-editor-draggable-handle"
            >
              mdi-drag
            </v-icon>
          </v-col>

          <v-col class="content-editor-draggable-content">
            <div class="content-editor-draggable-header">
              <v-textarea
                :value="message.logic"
                class="content-editor-draggable-logic"
                filled
                rounded
                :disabled="disabled"
                single-line
                full-width
                rows="1"
                auto-grow
                background-color="purple lighten-3"
                label="Flow control logic"
                @change="changeMessage({ element: 'logic', to: $event })"
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
                            addMessage({ after: message, duplicate: true })
                          "
                        >
                          mdi-content-duplicate
                        </v-icon>
                      </v-hover>
                    </template>
                    <span> Duplicate </span>
                  </v-tooltip>

                  <v-tooltip v-if="deletable" bottom>
                    <template #activator="{ on, attrs }">
                      <v-hover v-slot="{ hover }">
                        <v-icon
                          v-bind="attrs"
                          class="ml-2"
                          :color="hover ? 'red' : 'grey lighten-2'"
                          v-on="on"
                          @click="deleteMessage(message)"
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

            <type-selector
              :disabled="disabled"
              :message="message"
              :children="children"
            />
            <sender-selector
              v-if="message.type !== 'nestable'"
              :disabled="disabled"
              :message="message"
            />

            <template v-if="enableFileUpload">
              <v-file-input
                v-model="file"
                :label="'Pick ' + message.type + ' file for upload'"
                :accept="acceptedFiles"
                :disabled="disabled"
                @change="createBlobURL"
              />
              <!-- <v-textarea
                :value="message.attachment"
                full-width
                auto-grow
                rows="2"
                label="or enter a URL directly"
                @change="changeMessage({element: 'attachment', to: $event})"
              /> -->
              <h4 v-if="preview">
                PREVIEW - press button to upload
              </h4>
              <div v-if="file !== null">
                <v-btn
                  :loading="loading"
                  :disabled="loading"
                  color="blue-grey"
                  class="ma-2 white--text"
                  fab
                  @click="upload"
                >
                  <v-icon dark>
                    mdi-cloud-upload
                  </v-icon>
                </v-btn>

                <v-alert
                  v-if="uploadFailedAlert"
                  v-model="uploadFailedAlert.show"
                  type="error"
                  dismissible
                >
                  There was a problem uploading the file:
                  {{ uploadFailedAlert.errorMessage }}
                </v-alert>
              </div>

              <div v-if="message.type === 'audio'">
                <audio controls>
                  <source :src="url || message.attachment">
                </audio>
              </div>
              <div v-else-if="message.type === 'video'">
                <video
                  controls
                  :src="url || message.attachment"
                  type="video/mp4"
                />
              </div>
              <div v-else-if="message.type === 'image'">
                <v-img :src="url || message.attachment" />
              </div>
            </template>

            <v-textarea
              v-if="showTextField"
              :value="message.text"
              full-width
              auto-grow
              rows="2"
              label="Message text"
              :disabled="disabled"
              @change="changeMessage({ element: 'text', to: $event })"
            />

            <container
              v-else
              group-name="episode-messages"
              drag-handle-selector=".content-editor-draggable-handle"
              :get-child-payload="draggedMessage"
              @drag-start="
                setDragSource({
                  ...$event,
                  dragSource: message,
                  fromPhase: message.section_id,
                  fromParentIsNull: false
                })
              "
              @drop="
                moveMessage({
                  ...$event,
                  dragTarget: message,
                  toPhase: message.section_id,
                  toParentIsNull: false
                })
              "
            >
              <message-group
                v-for="submessage in children"
                :key="submessage.id"
                :all-messages-in-this-phase="allMessagesInThisPhase"
                :message="submessage"
                :deletable="children.length > 1"
                :course-name="courseName"
                :disabled="disabled"
              />
            </container>
          </v-col>
          <!-- content-editor-draggable-content -->
        </v-row>
        <v-btn
          fab
          size="12"
          :disabled="disabled"
          color="green"
          class="content-editor-draggable-add"
          @click="addMessage({ after: message })"
        >
          <v-icon color="white">
            mdi-plus
          </v-icon>
        </v-btn>
      </v-container>
    </v-sheet>
  </draggable>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'
import { Container, Draggable } from 'vue-smooth-dnd'

export default {
  components: {
    Container,
    Draggable,
  },
  props: {
    message: {
      type: Object,
      required: true,
    },
    allMessagesInThisPhase: {
      type: Array,
      required: true,
    },
    deletable: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: true,
    },
    courseName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      file: null,
      uploadFailedAlert: null,
      url: null,
      preview: false,
    }
  },
  computed: {
    children() {
      return this.allMessagesInThisPhase.filter(m => m.parent === this.message.id)
    },
    enableFileUpload() {
      return ['audio', 'video', 'image'].includes(this.message.type)
    },
    showTextField() {
      return ['text', 'image', 'audio', 'video'].includes(this.message.type)
    },
    acceptedFiles() {
      return {
        image: 'image/png, image/jpeg, image/gif',
        audio: 'audio/x-mpeg',
        video: 'video/mp4',
      }
    },
  },
  watch: {
    loader() {
      const l = this.loader
      this[l] = !this[l]

      setTimeout(() => (this[l] = false), 3000)

      this.loader = null
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
    draggedMessage(index) {
      const msg = this.children[index]
      const id = msg.id
      this.setDraggedMessageInfo({ id, index })
    },
    async upload() {
      this.loading = true
      const fd = new FormData()
      fd.append('image', this.file, this.file.name)
      try {
        const result = await this.$axios.$post('https://' + process.env.NUXT_ENV_PROC_URL + '/content-editor/upload', fd, { params: { c: this.courseName } })
        this.loading = false
        if (result.success) {
          this.url = result.url
          this.preview = false
          await this.$apollo.mutate({
            mutation: require('~/graphql/UpdateMessageAttachment'),
            variables: {
              id: this.message.id,
              attachment: result.url,
            },
          })
        } else {
          this.uploadFailedAlert = {
            show: true,
            errorMessage: result.msg,
          }
        }
      } catch (ex) {
        this.uploadFailedAlert = {
          show: true,
          errorMessage: JSON.stringify(ex),
        }
      }
    },
    createBlobURL(file) {
      this.url = file ? URL.createObjectURL(file) : ''
      this.preview = !!file
    },
    // updateEpisodeEditStateToSpecsIfNull (editField) {
    //   if (!('state' in editField)) {
    //     this.$apollo.mutate({
    //       mutation: require('~/graphql/UpdateEpisodeEditState'),
    //       variables: {
    //         id: this.messageId,
    //         state: 'specs'
    //       }
    //     })
    //   }
    // },
    async deleteMessage() {
      if (confirm('Are you sure you want to delete this message?')) {
        // this.updateEpisodeEditStateToSpecsIfNull(editField)
        await this.$db.delete('message', this.message, this.message.section_id)
      }
    },
    async changeMessage({ element, to }) {
      const variables = {
        id: this.message.id,
      }
      variables[element] = to
      await this.$apollo.mutate({
        mutation: require('~/graphql/UpdateMessage' + element.toCamelCase()),
        variables,
      })
    },
    async addMessage({ after, duplicate }) {
      let variables = {}
      if (duplicate) {
        variables = { ...after }
        delete variables.id
        delete variables.section_id
        delete variables.__typename
      } else {
        variables.parent = after.parent
      }
      variables.phaseId = after.section_id
      variables.number = after.number + 1
      await this.$db.add('message', after, variables, after.section_id)
    },
  },
}
</script>

<style lang="css" scoped>
video {
  width: 100%;
}
</style>
