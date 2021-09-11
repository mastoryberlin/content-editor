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
          Commit your work
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="$emit('commit', commitMessage)">
            Please enter some words that describe the changes you have made.
            <v-text-field
              v-model="commitMessage"
              autofocus
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn type="submit" color="green">
            OK
          </v-btn>
          <v-btn @click="showCommitMessageDialog = false">
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
    loading: {
      type: Boolean,
      default: null
    },
    mayCommit: {
      type: Boolean,
      default: false
    },
    commitMessageExt: {
      type: String,
      default: ''
    }
  },
  emits: ['commit'],
  data: () => ({
    showCommitMessageDialog: false,
    commitMessage: '',
    label: 'Mark work as finished'
  }),
  computed: {
  }
}
</script>

<style lang="css" scoped>
</style>
