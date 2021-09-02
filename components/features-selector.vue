<template lang="html">
  <div class="features-selector">
    Available Features:
    <v-chip-group
      column
      multiple
    >
      <v-chip
        v-for="feature in allFeatures"
        :key="feature"
        class="features-selector-available"
        :class="availableFeatures.includes(feature) ? color[feature] : 'features-selector-unavailable'"
        @click="toggle(feature)"
      >
        {{ feature }}
      </v-chip>
    </v-chip-group>
  </div>
</template>

<script>
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
    allFeatures () {
      return Object.keys(this.color)
    },
    availableFeatures () {
      return this.phase.meta.features
    }
  },
  methods: {
    toggle (feature) {
      const f = [...this.availableFeatures]
      const i = f.indexOf(feature)
      if (i >= 0) {
        // Set feature to be unavailable
        f.splice(i, 1)
      } else {
        // Set feature to be available
        f.push(feature)
      }
      this.$apollo.mutate({
        mutation: require('~/graphql/UpdatePhaseFeatures'),
        variables: { id: this.phase.id, features: { features: f } }
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.features-selector
  &-unavailable
    text-decoration: line-through
</style>
