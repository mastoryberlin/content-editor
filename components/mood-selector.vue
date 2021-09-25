<template lang="html">
  <v-menu
    bottom
    offset-y
    :nudge-left="140"
  >
    <template #activator="{ on, attrs }">
      <div
        v-bind="attrs"
        v-on="on"
      >
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
        <v-col
          v-for="m in moods.filter(k => k != mood)"
          :key="m"
          cols="2"
          @click="mood = m"
        >
          <v-img
            :src="`/moods/${m}.png`"
            :alt="m"
            max-width="30"
            class="mt-2"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- <v-list>
      <v-list-item
        v-for="m in moods.filter(k => k != mood)"
        :key="m"
        class="mood-selector mood-selector-emojis"
        @click="mood = m"
      >
        <v-list-item-title>p</v-list-item-title>
      </v-list-item>
    </v-list> -->
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
        const mood = this.phase.meta.mood
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
.selected
  position: absolute
  left: 15px
  top: -15px
</style>
