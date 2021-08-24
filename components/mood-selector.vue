<template lang="html">
  <v-tooltip top>
    <template #activator="{on, attrs}">
      <div
        class="mood-selector"
        v-bind="attrs"
        v-on="on"
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

        <v-speed-dial
          v-model="moodSelectorOpen"
          transition="scale-transition"
          absolute
          bottom
          right
          direction="bottom"
        >
          <!-- class="mood-selector-mood" -->
          <template #activator>
            <v-avatar
              class="mood-selector mood-selector-mood"
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
          </template>
          <v-avatar
            v-for="m in moods.filter(k => k != mood)"
            :key="m"
            class="mood-selector mood-selector-emojis"
            @click="mood = m"
          >
            <img
              :src="`/moods/${m}.png`"
              :alt="m"
              class="mood-selector mood-selector-mood-image"
            >
          </v-avatar>
        </v-speed-dial>
      </div>
    </template>
    <span v-text="npc + ' is ' + (available ? printableMood : 'unavailable')" />
  </v-tooltip>
</template>

<script>
export default {
  props: {
    npc: {
      type: String,
      required: true
    },
    phase: {
      type: Object,
      required: true
    }
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
      'worried'
    ],
    moodSelectorOpen: false
  }),
  computed: {
    printableMood () {
      return this.mood.replace('-', ' ')
    },
    mood: {
      get () {
        const mood = this.phase.meta.mood
        return mood[this.npc] || 'happy'
      },
      set (v) {
        const mood = this.phase.meta.mood
        mood[this.npc] = v
        this.$apollo.mutate({
          mutation: require('~/graphql/UpdatePhaseMood'),
          variables: { id: this.phase.id, mood: { mood } }
        })
      }
    },
    available () {
      return this.mood !== 'unavailable'
    }
  }
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
</style>
