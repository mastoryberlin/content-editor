<template lang="html">
  <div class="prompt">
    <v-container class="prompt-meta">
      <v-row>
        <v-col
          cols="12"
          xs="6"
          sm="3"
        >
          <span class="prompt-meta-fab-title">
            From:
          </span>

          <v-speed-dial
            v-model="fromSpeedDial"
            class="prompt-meta-fab"
            direction="bottom"
            transition="scale-transition"
          >
            <template #activator>
              <v-btn
                v-model="fromSpeedDial"
                class="prompt-meta-fab-button"
                fab
              >
                <v-avatar>
                  <template v-if="prompt.who === 'unknown'">
                    ?
                  </template>
                  <img v-else :src="avatars[prompt.who]" :alt="prompt.who">
                </v-avatar>
              </v-btn>
            </template>
            <v-btn
              v-for="who in Object.keys(avatars).filter(k => k != prompt.who)"
              :key="who"
              fab
              @click="prompt.who = who; $emit('change')"
            >
              <v-avatar>
                <img :src="avatars[who]" :alt="who">
              </v-avatar>
            </v-btn>
          </v-speed-dial>
        </v-col>

        <v-col
          cols="12"
          xs="6"
          sm="3"
        >
          <span class="prompt-meta-fab-title">
            Type:
          </span>

          <v-speed-dial
            v-model="typeSpeedDial"
            class="prompt-meta-fab"
            direction="bottom"
            transition="scale-transition"
          >
            <template #activator>
              <v-btn
                v-model="typeSpeedDial"
                class="prompt-meta-fab-button"
                fab
              >
                <v-avatar>
                  <v-icon :color="typeIconColors[prompt.type]">
                    {{ typeIcons[prompt.type] }}
                  </v-icon>
                </v-avatar>
              </v-btn>
            </template>
            <v-btn
              v-for="type in Object.keys(typeIcons).filter(k => k != prompt.type)"
              :key="type"
              fab
              @click="prompt.type = type; $emit('change')"
            >
              <v-avatar>
                <v-icon :color="typeIconColors[type]">
                  {{ typeIcons[type] }}
                </v-icon>
              </v-avatar>
            </v-btn>
          </v-speed-dial>
        </v-col>

        <v-col
          cols="12"
          xs="8"
          sm="5"
        >
          <v-chip
            v-for="(hint, i) in lengthHints(prompt.msg)"
            :key="i"
            class="prompt-meta-hint"
          >
            <v-icon>
              {{ hintIcons[i] }}
            </v-icon>
            {{ hint }}
          </v-chip>
        </v-col>

        <v-col
          cols="12"
          xs="4"
          sm="1"
        >
          <v-menu offset-y>
            <template #activator="{on, attrs}">
              <v-btn
                v-bind="attrs"
                fab
                small
                v-on="on"
              >
                <v-icon>mdi-dots-horizontal</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item
                v-for="(item, index) in menu"
                :key="index"
                @click="$emit('action', item.action)"
              >
                <v-list-item-title>
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </v-container>

    <v-textarea
      v-model="prompt.msg"
      class="prompt-body"
      solo
      auto-grow
      :background-color="color"
      @change="$emit('change')"
    />
  </div>
</template>

<script>
export default {
  props: {
    prompt: {
      type: Object,
      required: true
    },
    color: {
      type: String,
      default: 'amber lighten-4'
    }
  },
  emits: [
    'change',
    'action'
  ],
  data: () => ({
    fromSpeedDial: false,
    typeSpeedDial: false,
    avatars: {
      prof: '/npcs/professor.jpg',
      vz: '/npcs/vz.png',
      nick: '/npcs/nick.png',
      alicia: '/npcs/alicia.png'
    },
    typeIcons: {
      text: 'mdi-message-text',
      video: 'mdi-youtube',
      audio: 'mdi-microphone'
    },
    typeIconColors: {
      text: 'blue',
      video: 'red',
      audio: 'green'
    },
    hintIcons: [
      'mdi-alphabetical',
      'mdi-keyboard-space',
      'mdi-timer-outline'
    ],
    menu: [
      {
        title: 'Insert new message before this one',
        action: 'insertAbove'
      },
      {
        title: 'Insert new message after this one',
        action: 'insertBelow'
      },
      {
        title: 'Split message at cursor position',
        action: 'split'
      },
      {
        title: 'Merge with the next message',
        action: 'merge'
      },
      {
        title: 'Delete message',
        action: 'delete'
      }
    ]
  }),
  methods: {
    lengthHints (msg) {
      const { charCount, wordCount, readTime } = this.$readstat(msg)
      return [
        `${charCount} characters`,
        `${wordCount} words`,
        `${readTime} mins reading time`
      ]
    }
  }
}
</script>

<style lang="sass" scoped>
.prompt
  &-meta
    &-fab
      display: inline
      &-title
        font-weight: bold
        margin-right: 2em
    &-hint
      margin: 3px
</style>
