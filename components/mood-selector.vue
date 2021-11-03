<template lang="html">
  <v-menu
    bottom
    offset-y
    :nudge-left="140"
  >
    <template #activator="menuActivator">
      <div
        v-bind="menuActivator.attrs"
        v-on="menuActivator.on"
      >
        <v-tooltip top>
          <template #activator="npcActivator">
            <div
              class="mood-selector"
              v-bind="npcActivator.attrs"
              v-on="npcActivator.on"
            >
              <v-avatar
                @click="available = !available"
              >
                <img
                  :src="`/npcs/${npc.toLowerCase()}.png`"
                  :alt="npc"
                  :class="available ? null : 'mood-selector-image-unavailable'"
                >
              </v-avatar>

              <v-avatar
                class="mood-selector selected"
              >
                <template v-if="!moods.includes(mood)">
                  ?
                </template>
                <img
                  :src="`/moods/${available ? mood : 'unavailable'}.png`"
                  :alt="mood"
                  class="mood-selector mood-selector-mood-image"
                >
              </v-avatar>
            </div>
          </template>
          <span v-text="npc + ' is ' + (available ? printableMood : 'unavailable')" />
        </v-tooltip>
      </div>
    </template>
    <v-card>
      <v-row no-gutters class="pa-3">
        <v-hover
          v-for="m in moods.filter(k => k != mood)"
          v-slot="{hover}"
          :key="m"
        >
          <v-col
            cols="2"
            :class="hover ? 'mood-selector-mood-hover' : null"
            @click="changeMood(m)"
          >
            <v-tooltip top>
              <template #activator="moodActivator">
                <v-img
                  :src="`/moods/${m}.png`"
                  :alt="m"
                  max-width="30"
                  class="mt-2"
                  v-bind="moodActivator.attrs"
                  v-on="moodActivator.on"
                />
              </template>
              <span v-text="m" />
            </v-tooltip>
          </v-col>
        </v-hover>
      </v-row>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  props: {
    npc: {
      type: String,
      required: true,
    },
    phase: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    moods: [
      'unavailable',
      'disappointed',
      'glad',
      'happy',
      'in-love',
      'lol',
      'sad',
      'wondering',
      'worried',
    ],
    moodSelectorOpen: false,
  }),
  computed: {
    printableMood() {
      return this.mood.replace('-', ' ')
    },
    mood: {
      get() {
        const mood = this.phase.meta.mood
        return mood[this.npc] || 'happy'
      },
      set(v) {
        let mood = this.phase.meta.mood
        if (typeof mood[this.npc] === 'undefined') {
          mood = JSON.parse(JSON.stringify(this.phase.meta.mood))
        }
        mood[this.npc] = v
        this.$apollo.mutate({
          mutation: require('~/graphql/UpdatePhaseMood'),
          variables: { id: this.phase.id, mood: { mood } },
        })
      },
    },
    available() {
      return this.mood !== 'unavailable'
    },
  },
  methods: {
    changeMood(m) {
      this.mood = m
    },
  },
}
</script>

<style lang="sass" scoped>
.mood-selector
  position: relative
  &-image
    &-unavailable
      filter: gray /* IE6-9 */
      -webkit-filter: grayscale(1) brightness(1.2) /* Google Chrome, Safari 6+ & Opera 15+ */
      -moz-filter: grayscale(1) brightness(1.2) /* Google Chrome, Safari 6+ & Opera 15+ */
      filter: grayscale(1) brightness(1.2)
  &-mood
    right: -60%
    bottom: 35%
    &-image
      transform: scale(0.6)
    &-hover
      background: #ddd
      border-radius: inherit
.selected
  position: absolute
  left: 15px
  top: -15px
</style>
