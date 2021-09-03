
<template>
  <draggable>
    <v-sheet
      elevation="2"
      rounded
      class="mx-4 my-8 pa-3 content-editor-draggable"
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
                @input="changeMessageText({id: message.id, element: 'logic', to: $event})"
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
                v-model="files"
                placeholder="Upload your documents"
                label="File input"
                multiple
                show-size
                accept="audio/mp3"
                prepend-icon="mdi-microphone"
                @change="onChange"
              />
              <v-textarea
                :value="message.audio"
                full-width
                auto-grow
                rows="2"
                label="Enter URL"
                @input="changeMessageText({id: message.id, element: 'audio', to: $event})"
              />
              <div
                v-if="url"
              >
                <audio controls>
                  <source
                    :src="url"
                  >
                </audio>
              </div>
              <div
                v-else
              >
                <audio
                  controls
                >
                  <source :src="message.audio">
                  />
                </audio>
              </div>

              </audio>
              </v-textarea>
              </v-file-input>
            </div>
            <div
              v-else-if="message.type == 'video'"
              class="content-editor-draggable-message"
            >
              <v-file-input
                v-model="files"
                placeholder="Upload your documents"
                label="File input"
                multiple
                show-size
                prepend-icon="mdi-youtube"
                accept="video/mp4, video/mov"
                @change="onChange"
              >
                <template #selection="{ text }">
                  <v-chip
                    small
                    label
                    color="primary"
                  >
                    {{ text }}
                  </v-chip>
                </template>
              </v-file-input>
              <v-textarea
                :value="message.video"
                full-width
                auto-grow
                rows="2"
                label="Enter URL"
                @input="changeMessageText({id: message.id, element: 'video', to: $event})"
              />
              <div
                v-if="url"
              >
                <video
                  controls
                  :src="url"
                  type="video/mp4"
                />
              </div>
              <div
                v-else
              >
                <video
                  controls
                  :src="message.video"
                  type="video/mp4"
                />
              </div>
            </div>

            <div
              v-else-if="message.type == 'text'"
              class="content-editor-draggable-message"
            >
              <v-textarea
                :value="message.text"
                full-width
                auto-grow
                rows="2"
                label="Enter message"
                @change="changeMessageText({id: message.id, element: 'text', to: $event})"
              />
            </div>

            <div
              v-else-if="message.type == 'image'"
              class="content-editor-draggable-message"
            >
              <v-file-input
                v-model="files"
                multiple
                show-size
                counter
                type="file"
                label="File input"
                prepend-icon="mdi-camera"
                accept="image/png, image/jpeg, image/bmp, image/gif"
                @change="onChange"
              />
              <v-textarea
                :value="message.text"
                full-width
                auto-grow
                rows="2"
                label="Enter URL"
                @input="changeMessageText({id: message.id, element: 'text', to: $event})"
              />
              <v-img :src="message.text" />
              <v-img v-if="url" :src="url" />
            </div>

            <container
              v-else
              group-name="episode-messages"
              drag-handle-selector=".content-editor-draggable-handle"
              :get-child-payload="setDragIndex"
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
            </div>
          </v-col><!-- content-editor-draggable-content -->
        </v-row>

        <div v-if="message.type !== 'text'">
          <div v-if="url !== null">
            <v-btn
              :loading="loading5"
              :disabled="loading5"
              color="blue-grey"
              class="ma-2 white--text"
              fab
              @click="onUpload"
            >
              <v-icon dark>
                mdi-cloud-upload
              </v-icon>
            </v-btn>
          </div>
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
    }
  },

  data () {
    return {
      loader: null,
      loading5: false,
      selectedFile: null,
      url: null,
      files: null,
      File
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
    onChange (event) {
      console.log(event)
      this.File = event[0]
      this.url = URL.createObjectURL(event[0])
    },
    onUpload () {
      this.loader = 'loading5'
      // --------------------------------------------------------------------------
      const fd = new FormData()
      fd.append('image', this.File, this.File.name)
      this.$axios.post('https://dev-proc.mastory.io/upload', fd)
        .then((res) => {
          console.log(res)
        })
    },
    changeMessageText () {
      this.$apollo.mutate({
        mutation: require('~/graphql/UpdateMessageText'),
        variables: {
          id: this.message.id,
          text: this.message.text
        }
      })
    },
    ...mapMutations([
      'addMessage',
      'deleteMessage',
      'moveMessage',
      'setDragIndex',
      'setDragSource'
    ])
  }
}
</script>

<style lang="css" scoped>
video{
  width: 100%;
}
</style>
