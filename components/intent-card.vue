<template lang="html">
  <v-card class="ma-4">
    <v-card-title>
      <small>A student might</small>
      &nbsp;
      <v-text-field
        v-if="editing"
        autofocus
        dense
        :value="name"
        class="text-h6 font-italic"
        @keyup.esc="editing = false"
        @change="changeIntentName"
        @blur="editing = false"
      />
      <em v-else v-text="name" />
      <v-icon v-if="!editing" @click="editing = !editing">
        mdi-pencil
      </v-icon>
    </v-card-title>

    <v-card-subtitle v-if="hasSubintents" v-text="'like this:'" />
    <v-alert v-else type="warning">
      There are no example messages yet.
      This interaction will be ignored.
    </v-alert>

    <v-card-text>
      <v-list subheader>
        <template v-for="sub in subintents">
          <v-subheader :key="sub.id">
            <span>Examples of</span>&nbsp;<strong>{{ sub.name }}</strong>&nbsp;<span>utterances:</span>
          </v-subheader>
          <v-list-group v-for="replica in sub.replicas" :key="replica.id">
            <template #activator>
              <v-list-item-icon>
                <v-icon>mdi-chat-question</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>
                  “{{ replica.message }}”
                </v-list-item-title>
              </v-list-item-content>
            </template>

            <v-list-item>
              <v-list-item-icon>
                <v-avatar>
                  <img
                    :src="`/npcs/alicia.png`"
                    alt="Alicia"
                  >
                </v-avatar>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>
                  “i dont get it y r we even supposed to install an app for school ???”
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
        </template>

        <v-divider v-if="hasSubintents" />
        <v-dialog
          v-model="showAddSubintentDialog"
          width="600"
        >
          <template #activator="{on, attrs}">
            <v-list-item v-bind="attrs" v-on="on">
              <v-list-item-icon><v-icon>mdi-plus</v-icon></v-list-item-icon>
              <v-list-item-title>Add {{ hasSubintents ? 'another' : 'a' }} way of saying it</v-list-item-title>
            </v-list-item>
          </template>

          <v-form ref="addSubintentForm" @submit.prevent="addSubintent">
            <v-card>
              <v-card-title>
                Add a way of saying it
              </v-card-title>

              <v-card-text>
                <p>
                  Enter here how a student might
                  <em>{{ name }}</em>:
                  <v-text-field
                    ref="addSubintentFormReplicaField"
                    v-model="replicaMessage"
                    autofocus
                    persistent-hint
                    hint="Try to write as naturally as possible"
                    :rules="[replicaMessage !== '' || 'This field may not be left empty']"
                  />
                </p>

                <p>
                  Next, think of an <strong>adjective</strong>
                  that could be used as an adverb to describe
                  this way of saying it:
                  <v-combobox
                    v-model="subintentName"
                    auto-select-first
                    :items="subintents"
                    item-text="name"
                    :filter="filter"
                    persistent-hint
                    hint="Examples: interested, lazy ..."
                    :rules="[subintentName !== '' || 'This field may not be left empty']"
                  />
                </p>

                <p>
                  <v-checkbox
                    v-model="keepAddSubintentDialogOpen"
                    label="Keep this dialog open"
                    persistent-hint
                    hint="Check this box to add multiple messages in a row"
                  />
                </p>
              </v-card-text>

              <v-card-actions>
                <v-spacer />
                <v-btn color="green" type="submit">
                  Add
                </v-btn>
                <v-btn @click="showAddSubintentDialog = false">
                  Cancel
                </v-btn>
                <v-spacer />
              </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    intent: {
      type: Object,
      required: true
    }
  },
  emits: [
    'change-name'
  ],
  data: () => ({
    editing: false,
    verbs: ['ask', 'express', 'suggest', 'state'],
    updatedName: null,
    showAddSubintentDialog: false,
    keepAddSubintentDialogOpen: false,
    replicaMessage: '',
    subintentName: ''
  }),
  computed: {
    name () {
      return this.updatedName || this.intent.name
    },
    subintents () {
      return this.intent.subintents
    },
    hasSubintents () {
      return this.subintents.length > 0
    }
  },
  methods: {
    changeIntentName (newName) {
      const firstWord = newName.split(' ')[0].toLowerCase()
      if (this.verbs.includes(firstWord)) {
        try {
          this.$apollo.mutate({
            mutation: require('~/graphql/UpdateIntent'),
            variables: {
              id: this.intent.id,
              name: newName
            }
          })
          this.updatedName = newName
          this.$emit('change-name', newName)
        } finally {
          this.editing = false
        }
      } else {
        alert('Please start the intent with one of the allowed verbs:\n' + this.verbs.join(', '))
      }
    },
    async addSubintent () {
      if (this.keepAddSubintentDialogOpen) {
        this.$refs.addSubintentForm.reset()
        this.$refs.addSubintentFormReplicaField.focus()
      } else {
        this.showAddSubintentDialog = false
      }
      const { data: { insert_subintent_one: { id } } } = await this.$apollo.mutate({
        mutation: require('~/graphql/AddSubintent'),
        variables: {
          intent_id: this.intent.id,
          name: this.subintentName
        }
      })
      this.$apollo.mutate({
        mutation: require('~/graphql/AddReplica'),
        variables: {
          subintent_id: id,
          message: this.replicaMessage
        }
      })
      if (!this.keepAddSubintentDialogOpen) {
        this.replicaMessage = ''
        this.subintentName = ''
      }
    },
    filter (item, queryText, itemText) {
      if (item.header) { return false }

      const hasValue = val => val != null ? val : ''

      const text = hasValue(itemText)
      const query = hasValue(queryText)

      return text.toString()
        .toLowerCase()
        .includes(query.toString().toLowerCase())
    }
  }
}
</script>

<style lang="css" scoped>
</style>
