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
                autofocus
                single-line
                full-width
                rows="1"
                auto-grow
                background-color="purple lighten-3"
                label="Flow control logic"
                @change="changeMessage({element: 'logic', to: $event})"
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
                          @click="addMessage({after: message, duplicate: true})"
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
                    v-if="deletable"
                    bottom
                  >
                    <template #activator="{on, attrs}">
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
                    <span>
                      Delete
                    </span>
                  </v-tooltip>
                </template>
              </v-textarea>
            </div>

            <type-selector :message="message" />

            <div
              v-if="message.type == 'audio'"
              class="content-editor-draggable-message"
            >
              <v-file-input
                v-model="file"
                placeholder="Upload audio file"
                label="File input"
                prepend-icon="mdi-microphone"
                accept="audio/x-mpeg"
              />
              <v-textarea
                :value="message.attachment"
                full-width
                auto-grow
                rows="2"
                label="Enter URL"
                @change="changeMessage({element: 'attachment', to: $event})"
              />
              <audio controls>
                <source :src="message.attachment">
              </audio>
            </div>

            <div
              v-else-if="message.type == 'video'"
              class="content-editor-draggable-message"
            >
              <v-file-input
                v-model="file"
                placeholder="Upload video file"
                label="File input"
                prepend-icon="mdi-youtube"
                accept="video/mp4"
              />
              <v-textarea
                :value="message.attachment"
                full-width
                auto-grow
                rows="2"
                label="Enter URL"
                @change="changeMessage({element: 'attachment', to: $event})"
              />
              <video
                controls
                :src="message.attachment"
                type="video/mp4"
              /></video>
            </div>

            <div
              v-else-if="message.type == 'image'"
              class="content-editor-draggable-message"
            >
              <v-file-input
                type="file"
                label="File input"
                prepend-icon="mdi-message-image"
                accept="image/png, image/jpeg, image/gif"
              />
              <v-textarea
                :value="message.attachment"
                full-width
                auto-grow
                rows="2"
                label="Enter URL"
                @change="changeMessage({element: 'attachment', to: $event})"
              />

              <v-img
                :src="message.attachment"
              />
            </div>

            <div
              v-else-if="message.type === 'text'"
              class="content-editor-draggable-message"
            >
              <v-textarea
                :value="message.text"
                full-width
                auto-grow
                rows="2"
                label="Message text"
                @change="changeMessage({element: 'text', to: $event})"
              />
            </div>

            <!-- :get-child-payload="setDragIndex" -->
            <container
              v-else
              group-name="episode-messages"
              drag-handle-selector=".content-editor-draggable-handle"
              @drag-start="setDragSource({
                ...$event,
                dragSource: message,
              })"
              @drop="moveMessage({
                ...$event,
                dragTarget: message,
              })"
            >
              <message-group
                v-for="submessage in message.messages"
                :key="submessage.id"
                :message="submessage"
                :deletable="message.messages.length > 1"
              />
            </container>
          </v-col><!-- content-editor-draggable-content -->
        </v-row>

        <div v-if="message.type !== 'text' && file !== null">
          <v-btn
            :loading="loading"
            :disabled="loading"
            color="blue-grey"
            class="ma-2 white--text"
            fab
            @click="onUpload"
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
            There was a problem uploading the file: {{ uploadFailedAlert.errorMessage }}
          </v-alert>
        </div>

        <v-btn
          fab
          size="12"
          color="green"
          class="content-editor-draggable-add"
          @click="addMessage({after: message})"
        >
          <v-icon color="white">
            mdi-plus
          </v-icon>
        </v-btn>
        </v-if>
        </div>
      </v-container>
    </v-sheet>
  </draggable>
</template>

<script>
import { mapMutations } from 'vuex'
import { Container, Draggable } from 'vue-smooth-dnd'

export default {
  components: {
    Container,
    Draggable
  },
  props: {
    message: {
      type: Object,
      required: true
    },
    deletable: {
      type: Boolean,
      default: true
    },
    courseName: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      file: null,
      uploadFailedAlert: null
    }
  },
  watch: {
    loader () {
      const l = this.loader
      this[l] = !this[l]

      setTimeout(() => (this[l] = false), 3000)

      this.loader = null
    }
  },
  methods: {
    async onUpload () {
      this.loading = true
      const fd = new FormData()
      fd.append('image', this.file, this.file.name)
      try {
        const result = await this.$axios.$post('upload', fd, { params: { c: this.courseName } })
        if (result.success) {
          await this.$apollo.mutate({
            mutation: require('~/graphql/UpdateMessageAttachment'),
            variables: {
              id: this.message.id,
              attachment: result.url
            }
          })
        } else {
          this.uploadFailedAlert = {
            show: true,
            errorMessage: result.msg
          }
        }
      } catch (ex) {
        this.uploadFailedAlert = {
          show: true,
          errorMessage: JSON.stringify(ex)
        }
      }
    },
    ...mapMutations([
      'deleteMessage',
      'moveMessage',
      'setDragIndex',
      'setDragSource'
    ]),
    async changeMessage ({ element, to }) {
      const variables = {
        id: this.message.id
      }
      variables[element] = to
      await this.$apollo.mutate({
        mutation: require('~/graphql/UpdateMessage' + element.toCamelCase()),
        variables
      })
    },
    async addMessage ({ after, duplicate = false }) {
      let variables = {}
      if (duplicate) {
        variables = { ...after }
        delete variables.id
      }
      variables.phaseId = after.section_id
      variables.number = after.number + 1
      await this.$apollo.mutate({
        mutation: require('~/graphql/AddMessage'),
        variables
      })
    }
  }
}
</script>

<style lang="css" scoped>
video{
  width: 100%;
}
</style>
