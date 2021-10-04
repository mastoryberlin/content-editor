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
          <v-list-item v-for="replica in sub.replicas" :key="replica.id">
            <!-- <template #activator> -->
            <v-list-item-icon>
              <v-icon>mdi-chat-question</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>
                “{{ replica.message }}”
              </v-list-item-title>
            </v-list-item-content>

            <v-hover v-slot="{hover}">
              <v-icon :color="hover ? 'blue' : null" @click.stop="editReplica(replica, sub)">
                mdi-pencil
              </v-icon>
            </v-hover>

            <v-hover v-slot="{hover}">
              <v-icon :color="hover ? 'red' : null" @click.stop="deleteReplica(replica)">
                mdi-delete
              </v-icon>
            </v-hover>
            <!-- </template> -->

            <!-- <v-list-item>
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
            </v-list-item> -->
          </v-list-item>
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
                    v-model="addSubintentReplicaMessage"
                    autofocus
                    persistent-hint
                    hint="Try to write as naturally as possible"
                    :rules="[addSubintentReplicaMessage !== '' || 'This field may not be left empty']"
                  />
                </p>

                <p>
                  Next, think of an <strong>adjective</strong>
                  that could be used as an adverb to describe
                  this way of saying it:
                  <v-combobox
                    v-model="addSubintentName"
                    auto-select-first
                    :items="subintents"
                    item-text="name"
                    :filter="filter"
                    persistent-hint
                    hint="Examples: interested, lazy ..."
                    :rules="[addSubintentName !== '' || 'This field may not be left empty']"
                    :search-input.sync="search"
                    @keyup.tab="autocomplete"
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

        <v-dialog
          v-model="showEditSubintentDialog"
          width="600"
        >
          <v-form ref="editSubintentForm" @submit.prevent="modifyReplica">
            <v-card>
              <v-card-title>
                Edit the way of saying it
              </v-card-title>

              <v-card-text>
                <p>
                  Enter here how a student might
                  <em>{{ name }}</em>:
                  <v-text-field
                    ref="editSubintentFormReplicaField"
                    v-model="editSubintentReplicaMessage"
                    autofocus
                    persistent-hint
                    hint="Try to write as naturally as possible"
                    :rules="[editSubintentReplicaMessage !== '' || 'This field may not be left empty']"
                  />
                </p>

                <p>
                  Next, think of an <strong>adjective</strong>
                  that could be used as an adverb to describe
                  this way of saying it:
                  <v-combobox
                    v-model="editSubintentName"
                    auto-select-first
                    :items="subintents"
                    item-text="name"
                    :filter="filter"
                    persistent-hint
                    hint="Examples: interested, lazy ..."
                    :rules="[editSubintentName !== '' || 'This field may not be left empty']"
                    :search-input.sync="search"
                    @keyup.tab="editAutocomplete"
                  />
                </p>
              </v-card-text>

              <v-card-actions>
                <v-spacer />
                <v-btn color="green" type="submit">
                  Apply changes
                </v-btn>
                <v-btn @click="showEditSubintentDialog = false">
                  Cancel
                </v-btn>
                <v-spacer />
              </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
      </v-list>
    </v-card-text>

    <v-btn
      fab
      size="12"
      color="green"
      class="content-editor-draggable-add"
      @click="$emit('add-intent')"
    >
      <v-icon color="white">
        mdi-plus
      </v-icon>
    </v-btn>
  </v-card>
</template>

<script>
export default {
  props: {
    intent: {
      type: Object,
      required: true,
    },
    allowedVerbs: {
      type: Array,
      required: true,
    },
  },
  emits: [
    'change-name',
    'add-intent',
  ],
  data: () => ({
    editing: false,
    updatedName: null,
    showAddSubintentDialog: false,
    keepAddSubintentDialogOpen: false,
    addSubintentName: '',
    addSubintentReplicaMessage: '',
    showEditSubintentDialog: false,
    editingReplica: null,
    editingSubintent: null,
    editSubintentName: '',
    editSubintentReplicaMessage: '',
    search: '',
  }),
  computed: {
    name() {
      return this.updatedName || this.intent.name
    },
    subintents() {
      return this.intent.subintents
    },
    hasSubintents() {
      return this.subintents.length > 0
    },
  },
  methods: {
    changeIntentName(newName) {
      const firstWord = newName.split(' ')[0].toLowerCase()
      if (this.allowedVerbs.includes(firstWord)) {
        try {
          this.$apollo.mutate({
            mutation: require('~/graphql/UpdateIntent'),
            variables: {
              id: this.intent.id,
              name: newName,
            },
          })
          this.updatedName = newName
          this.$emit('change-name', newName)
        } finally {
          this.editing = false
        }
      } else {
        alert('Please start the intent with one of the allowed verbs:\n' + this.allowedVerbs.join(', '))
      }
    },
    async addSubintent() {
      console.log('5555555555555')
      if (this.keepAddSubintentDialogOpen) {
        this.$refs.addSubintentForm.resetValidation()
        this.$refs.addSubintentFormReplicaField.select()
        this.$refs.addSubintentFormReplicaField.focus()
      } else {
        this.showAddSubintentDialog = false
      }
      const addSubintentName = String(this.addSubintentName).trim()
      const existingSubintent = this.subintents.find(s => s.name === addSubintentName)
      let id
      if (existingSubintent) {
        id = existingSubintent.id
      } else {
        const resp = await this.$db.add('subintent', null, { name: addSubintentName }, this.intent.id)
        id = resp.data.insert_subintent_one.id
      }
      this.$db.add('replica', null, { subintent_id: id, message: this.addSubintentReplicaMessage }, id)
      if (!this.keepAddSubintentDialogOpen) {
        this.addSubintentReplicaMessage = ''
        this.addSubintentName = ''
      }
    },

    editReplica(replica, subintent) {
      this.editingReplica = replica
      this.editingSubintent = subintent
      this.editSubintentName = subintent.name
      this.editSubintentReplicaMessage = replica.message
      this.showEditSubintentDialog = true
    },
    async modifyReplica() {
      this.showEditSubintentDialog = false
      const subintent = this.editingSubintent
      const editSubintentName = String(this.editSubintentName).trim()
      let subintentId = subintent.id
      const changeSubintent = editSubintentName !== subintent.name
      if (changeSubintent) {
        // Change the subintent this replica belongs to
        const existingSubintent = this.subintents.find(s => s.name === editSubintentName)
        if (existingSubintent) {
          subintentId = existingSubintent.id
        } else {
          const resp = await this.$db.add('subintent', null, { name: editSubintentName }, this.intent.id)
          subintentId = resp.data.insert_subintent_one.id
        }
      }
      await this.$apollo.mutate({
        mutation: require('~/graphql/UpdateReplica'),
        variables: {
          id: this.editingReplica.id,
          subintent_id: subintentId,
          message: this.editSubintentReplicaMessage,
        },
      })
      if (changeSubintent) {
        this.deleteEmptySubintents()
      }
    },
    async deleteReplica(replica) {
      if (confirm('Are you sure you want to delete this example?')) {
        await this.$db.delete('replica', { id: replica.id }, null)
        this.deleteEmptySubintents()
      }
    },

    async deleteEmptySubintents() {
      const resp = await this.$apollo.query({
        query: require('~/graphql/GetSubintentsWithNumberOfReplicas'),
      })
      resp.data.subintent
        .filter(s => s.replicas_aggregate.aggregate.count === 0)
        .forEach((subintent) => {
          const { id } = subintent
          this.$db.delete('subintent', { id }, null)
        })
    },

    autocomplete(e) {
      if (this.search) {
        e.preventDefault()
        const search = this.search.toLowerCase()
        const match = this.subintents.find(s => s.name.toLowerCase().startsWith(search))
        if (match) {
          this.addSubintentName = match.name
        }
      }
    },
    editAutocomplete(e) {
      if (this.search) {
        e.preventDefault()
        const search = this.search.toLowerCase()
        const match = this.subintents.find(s => s.name.toLowerCase().startsWith(search))
        if (match) {
          this.editSubintentName = match.name
        }
      }
    },
    filter(item, queryText, itemText) {
      if (item.header) { return false }

      const hasValue = val => val != null ? val : ''

      const text = hasValue(itemText)
      const query = hasValue(queryText)

      return text.toString()
        .toLowerCase()
        .includes(query.toString().toLowerCase())
    },
  },
}
</script>

<style lang="css" scoped>
</style>
