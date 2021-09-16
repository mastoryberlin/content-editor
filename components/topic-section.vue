<template lang="html">
  <v-expansion-panel>
    <v-expansion-panel-header>
      ({{ number }}) What might students say about “{{ topic.name }}”?
    </v-expansion-panel-header>

    <v-expansion-panel-content>
      <v-hover
        v-if="intents.length === 0"
        v-slot="{hover}"
      >
        <span
          :style="{cursor: 'pointer', color: hover ? 'green' : null}"
          @click="showAddIntentDialog = true"
        >
          Click here to add what students might say.
        </span>
      </v-hover>
      <template
        v-else
      >
        <intent-card
          v-for="intent in intents"
          :key="intent.id"
          :intent="intent"
          :allowed-verbs="allowedVerbs"
          @add-intent="showAddIntentDialog = true"
        />
      </template>
    </v-expansion-panel-content>

    <v-dialog
      v-model="showAddIntentDialog"
      width="600"
    >
      <v-form ref="addIntentForm" @submit.prevent="addIntent">
        <v-card>
          <v-card-title>
            Add what a student might say
          </v-card-title>

          <v-card-text>
            <p>
              Enter here what a student might say about {{ topic.name }}.
            </p>
            <p>
              <strong>Important:</strong> Make sure that the speech act you describe is directly concerned with “{{ topic.name }}”!
            </p>
            <p>
              Start with one of the verbs from this list:
              <ul>
                <li v-for="verb in allowedVerbs" :key="verb" v-text="verb" />
              </ul>
            </p>

            <p>
              <v-text-field
                ref="addIntentFormIntentNameField"
                v-model="addIntentName"
                prefix="A student might "
                autofocus
                persistent-hint
                hint="Describe the speech act: What is a student’s intent behind an utterance?"
                :rules="[
                  addIntentName !== '' || 'This field may not be left empty',
                  allowedVerbs.includes(wordsOfNewIntentName[0]) || 'Please start the intent with one of the verbs from the list above'
                ]"
              />
            </p>

            <p>
              <v-checkbox
                v-model="keepAddIntentDialogOpen"
                label="Keep this dialog open"
                persistent-hint
                hint="Check this box to add multiple speech acts in a row"
              />
            </p>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn color="green" type="submit">
              Add
            </v-btn>
            <v-btn @click="showAddIntentDialog = false">
              Cancel
            </v-btn>
            <v-spacer />
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-expansion-panel>
</template>

<script>
export default {
  props: {
    topic: {
      type: Object,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
  },
  data: () => ({
    intentsRelatedToThisTopic: [],
    addIntentName: '',
    showAddIntentDialog: false,
    keepAddIntentDialogOpen: false,
    allowedVerbs: ['ask', 'express', 'suggest', 'state'],
  }),
  apollo: {
    intentsRelatedToThisTopic() {
      return {
        query: require('~/graphql/GetIntentsForTopic'),
        variables: {
          topicId: this.topic.id,
        },
        update: data => data.intent,
        subscribeToMore: {
          document: require('~/graphql/RefreshIntentsForTopic'),
          variables: {
            topicId: this.topic.id,
          },
          updateQuery: (previousResult, { subscriptionData }) => {
            const newResult = { ...previousResult }
            newResult.intent = JSON.parse(JSON.stringify(subscriptionData.data.intent))
            return newResult
          },
        },
      }
    },
  },
  computed: {
    intents() {
      return this.intentsRelatedToThisTopic
    },
    wordsOfNewIntentName() {
      return this.addIntentName.toLowerCase().split(' ')
    },
  },
  methods: {
    addIntent() {
      if (!this.wordsOfNewIntentName.includes(this.topic.name.toLowerCase())) {
        if (!confirm('The speech act you are about to add,\n  "' +
          this.addIntentName + '",\ndoes not include "' +
          this.topic.name + '" literally.\nPlease confirm that this is really about ' +
          this.topic.name + '!')) {
          return
        }
      }
      if (this.keepAddIntentDialogOpen) {
        this.$refs.addIntentForm.resetValidation()
        this.$refs.addIntentFormIntentNameField.select()
        this.$refs.addIntentFormIntentNameField.focus()
      } else {
        this.showAddIntentDialog = false
      }
      this.$apollo.mutate({
        mutation: require('~/graphql/AddIntent'),
        variables: {
          topic_id: this.topic.id,
          name: this.addIntentName,
        },
      })
      if (!this.keepAddIntentDialogOpen) {
        this.addIntentName = ''
      }
    },
  },
}
</script>

<style lang="css" scoped>
</style>
