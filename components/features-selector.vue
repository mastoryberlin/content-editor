<template lang="html">
  <div class="features-selector">
    Available Features:
    <v-chip-group
      column
      multiple
    >
      <v-chip
        v-for="feature in Object.keys(color)"
        :key="feature"
        class="features-selector-available"
        :class="available(feature) ? color[feature] : 'features-selector-unavailable'"
        @click="changeFeatures({ phaseId: phase.id, feature: feature, to: !available(feature)})"
      >
        {{ feature }}
      </v-chip>
    </v-chip-group>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  props: {
    phase: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    color: {
      CCTV: 'teal',
      'Secret Folder': 'pink',
      'Calls From The Future': 'blue lighten-2',
      Rover: 'indigo'
    }
  }),
  computed: {
    // availableFeatures () {
    //   return this.$store.getters.featuresInPhase(this.phase.id)
    // }
  },
  methods: {
    ...mapMutations([
      'changeFeatures'
    ]),
    available (feature) {
      const f = [...this.$store.getters.featuresInPhase(this.phase.id)]
      return f.includes(feature)
    }
  }
}
</script>

<style lang="sass" scoped>
.features-selector
  &-unavailable
    text-decoration: line-through
</style>
