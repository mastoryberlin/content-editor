<template lang="html">
  <div class="features-selector">
    Available Features:
    <v-chip-group
      multiple
      active-class="features-selector-available warning"
    >
      <v-chip
        v-for="feature in features"
        :key="feature"
        :class="active ? null : 'features-selector-unavailable'"
      >
        {{ feature }}
      </v-chip>
    </v-chip-group>
  </div>
</template>

<script>
export default {
  data: () => ({
    features: [
      'Rover',
      'AR',
      'Secret Folder'
    ],
    color: {
      Rover: 'blue',
      AR: 'amber',
      'Secret Folder': 'purple'
    }
  })
}
</script>

<style lang="sass" scoped>
.features-selector
  &-unavailable
    text-decoration: line-through
  &-available
    text-decoration: none !important
</style>
