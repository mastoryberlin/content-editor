<template lang="html">
  <v-toolbar>
    <v-spacer />

    <v-dialog
      v-model="showCommitMessageDialog"
      max-width="500px"
    >
      <template #activator="{on, attrs}">
        <v-btn
          elevation="7"
          :loading="loading"
          :disabled="loading"
          v-bind="attrs"
          v-on="on"
        >
          Commit this state
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="text-h5">
          Commit your work
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="$emit('commit', commitMessage); onCommit();">
            <v-text-field
              v-model="commitMessage"
              autofocus
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn type="submit" color="green" @click="$emit('commit', commitMessage); onCommit();">
            OK
          </v-btn>
          <v-btn @click="closeDialog">
            Cancel
          </v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-spacer />
  </v-toolbar>
</template>

<script>
export default {
  props: {
    tabType: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: null,
    },
    mayCommit: {
      type: Boolean,
      default: false,
    },
    commitMessageExt: {
      type: String,
      default: '',
    },
  },
  emits: ['commit'],
  data: () => ({
    showCommitMessageDialog: false,
    commitMessage: '',
  }),
  computed: {
    storyId() {
      return this.$route.params.story
    },
    episodeId() {
      return this.$route.params.episode
    },
  },
  methods: {
    onCommit() {
      const payload = {
        storyId: this.storyId,
        episodeId: this.episodeId,
        commitMessage: this.commitMessage,
      }
      if (this.tabType === 'messageFlow') {
        this.$axios.post('https://proc.mastory.io/content-editor/commit/message-flow', payload)
      } else {
        this.$axios.post('https://proc.mastory.io/content-editor/commit/math-challenge', payload)
      }
      this.closeDialog()
    },
    closeDialog() {
      this.showCommitMessageDialog = false
      this.commitMessage = ''
    },
  },
}
</script>

<style lang="css" scoped>
</style>
