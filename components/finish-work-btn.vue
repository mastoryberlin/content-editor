<template>
  <v-dialog v-model="showCommitMessageDialog" max-width="500px">
    <template #activator="{ on, attrs }">
      <v-btn
        elevation="7"
        :loading="loading"
        :disabled="loading"
        v-bind="attrs"
        v-on="on"
      >
        <div v-if="buttonType === 'issue-pr'">
          <v-icon color="green">
            mdi-check-bold
          </v-icon>
          Mark as finished
          {{ mayCommit ? commitMessageExt : "and request approval" }}
        </div>
        <div v-else>
          Commit
        </div>
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="text-h5">
        <span v-if="buttonType === 'issue-pr'"> Create a pull request </span>
        <span v-else> Commit changes </span>
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="applyChanges">
          <v-text-field v-model="changeText" autofocus />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn type="submit" color="green" @click="applyChanges">
          OK
        </v-btn>
        <v-btn @click="closeDialog">
          Cancel
        </v-btn>
        <v-spacer />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    tabType: {
      type: String,
      default: null,
    },
    buttonType: {
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
    changeText: '',
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
    applyChanges() {
      let payload
      if (this.buttonType === 'issue-pr') {
        payload = {
          storyId: this.storyId,
          title: this.changeText,
        }
      } else if (this.buttonType === 'commit') {
        const episodeId = this.episodeId
        payload = {
          storyId: this.storyId,
          commitMessage: this.changeText,
        }
        if (episodeId) { payload.episodeId = episodeId }
      }
      const path = 'https://' + process.env.NUXT_ENV_PROC_URL + '/content-editor/' + this.buttonType + '/' + this.tabType
      this.$axios.post(path, payload)
      this.closeDialog()
    },
    closeDialog() {
      this.showCommitMessageDialog = false
      this.changeText = ''
    },
  },
}
</script>

<style lang="css" scoped>
</style>
