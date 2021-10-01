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
          <v-icon color="green">
            mdi-check-bold
          </v-icon>
          Mark as finished {{ mayCommit ? commitMessageExt : 'and request approval' }}
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="text-h5">
          Create a pull request
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="createPR">
            <v-text-field
              v-model="PRTitle"
              autofocus
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn type="submit" color="green" @click="createPR">
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
      default: null,
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
    PRTitle: '',
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
    createPR() {
      const payload = {
        storyId: this.storyId,
        title: this.PRTitle,
      }
      if (this.tabType === 'messageFlow') {
        this.$axios.post('https://proc.mastory.io/content-editor/issue-pr/message-flow', payload)
      } else {
        this.$axios.post('https://proc.mastory.io/content-editor/issue-pr/math-challenge', payload)
      }
      this.closeDialog()
    },
    closeDialog() {
      this.showCommitMessageDialog = false
      this.PRTitle = ''
    },
  },
}
</script>

<style lang="css" scoped>
</style>
