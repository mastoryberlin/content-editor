<template>
  <div class="">
    <div v-if="editingProhibited">
      <v-banner icon="mdi-lock" sticky color="orange">
        You cannot change data in this area.
      </v-banner>
    </div>

    <!-- TODO <span v-if="to === 'commit'">
        may apply changes to this area, but you will not be able
      cannot  -->

    <slot />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    needs: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      default: 'view', // Supports 'view', 'edit', and 'commit'
    },
  },
  computed: {
    ...mapGetters('user', [
      'may',
    ]),
    storyId() {
      return this.$route.params.story
    },
    editingProhibited() {
      const { to, may, needs, storyId } = this
      return to === 'edit' && !may(needs, storyId)
    },
  },
}
</script>
