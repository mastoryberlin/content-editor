<template>
  <v-row>
    <v-col>
      <template v-if="$apollo.loading">
        <v-skeleton-loader v-for="n in 5" :key="n" type="list-item" />
      </template>

      <template v-else-if="$apollo.error">An error occurred!</template>

      <template v-else>
        <apollo-subscribe-to-more
          :document="require('~/graphql/RefreshTopics')"
          :update-query="refreshAllTopics"
        />
        <v-combobox
          label="Topics Whitelist:"
          class="my-5"
          :value="topics"
          :filter="filter"
          :hide-no-data="!search"
          :items="allTopics"
          item-text="name"
          :search-input.sync="search"
          hide-selected
          :append-icon="null"
          multiple
          small-chips
          @change="editTopics"
        >
          <template #item="{ index, item }">
            <v-text-field
              v-if="editing === item"
              :value="editing.name"
              autofocus
              flat
              background-color="transparent"
              hide-details
              solo
              @change="
                $apollo.mutate({
                  mutation: require('~/graphql/UpdateTopicName'),
                  variables: { id: item.id, name: $event },
                })
              "
              @keyup.enter="editTopicName(index, item)"
            />
            <template v-else>
              {{ item.name }}
            </template>

            <v-spacer />

            <v-list-item-action @click.stop>
              <v-hover v-slot="{ hover }">
                <v-btn icon @click.stop.prevent="editTopicName(index, item)">
                  <v-icon :color="hover ? 'blue' : null">
                    {{ editing !== item ? "mdi-pencil" : "mdi-check" }}
                  </v-icon>
                </v-btn>
              </v-hover>
            </v-list-item-action>

            <v-list-item-action @click.stop>
              <v-hover v-slot="{ hover }">
                <v-btn icon @click.stop.prevent="deleteTopic(item)">
                  <v-icon :color="hover ? 'red' : null"> mdi-delete </v-icon>
                </v-btn>
              </v-hover>
            </v-list-item-action>
          </template>

          <template #selection="{ attrs, item, parent, selected }">
            <v-chip
              v-if="item === Object(item)"
              v-bind="attrs"
              :input-value="selected"
              label
              small
            >
              <span class="pr-2">
                {{ item.name }}
              </span>
              <v-icon small @click="parent.selectItem(item)"> $delete </v-icon>
            </v-chip>
          </template>

          <template #append-outer>
            <v-menu>
              <template #activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on"> mdi-dots-vertical </v-icon>
              </template>
              <v-list>
                <v-list-item v-for="(item, index) in menu" :key="index" link>
                  <v-list-item-title @click="item.action">
                    {{ item.title }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-combobox>
      </template>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    phase: {
      type: Object,
      required: true,
    },
    episodeId: {
      type: String,
      required: true,
    },
    whitelist: {
      type: Array,
      required: true,
    },
  },
  apollo: {
    allTopics: {
      query: require('~/graphql/GetTopics'),
      update: data => data.topic,
      subscribeToMore: {
        document: require('~/graphql/RefreshTopics'),
        updateQuery: (previousResult, { subscriptionData }) => {
          const newResult = { ...previousResult }
          newResult.topic = [...subscriptionData.data.topic]
          return newResult
        },
      },
    },
  },
  data() {
    return {
      allTopics: [],
      search: null,
      editing: null,
      editingIndex: -1,
      menu: [
        {
          title: 'Copy this list',
          action: this.copy,
        },
        {
          title: 'Copy this list over to all subsequent phases',
          action: this.copyToSubsequentPhases,
        },
      ],
    }
  },
  computed: {
    topics() {
      const list = this.whitelist
      if (list) {
        return list.map((t) => {
          const top = this.allTopics.find(at => at.id === t)
          let ret
          if (top) {
            ret = { id: t, name: top.name }
          } else {
            ret = { id: t, name: '' }
          }
          return ret
        })
      } else { return [] }
    },
  },

  methods: {
    refreshAllTopics(previousResult, { subscriptionData }) {
      console.log('refreshAllTopics', previousResult, subscriptionData)
      const newQueryResult = subscriptionData.data.topic
      const newResult = { ...previousResult, topic: { ...newQueryResult } }
      return newResult
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
    copy() {
      const text = this.topics.map(t => t.name).join(', ')
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
          .then(() => {
            console.log('Copied to clipboard!')
          })
          .catch((err) => {
            console.log(err)
          })
      } else if (window.clipboardData) {
        window.clipboardData.setData('Text', text)
      } else {
        const tempInput = document.createElement('input')
        tempInput.style = 'position: absolute; left: -1000px; top: -1000px'
        tempInput.value = text
        document.body.appendChild(tempInput)
        tempInput.select()
        document.execCommand('copy')
        document.body.removeChild(tempInput)
      }
    },
    copyToSubsequentPhases() {
      this.$apollo.mutate({
        mutation: require('~/graphql/UpdateSubsequentPhaseTopics'),
        variables: {
          episode_id: this.episodeId,
          afterNumber: this.phase.number,
          topic_whitelist: this.whitelist,
        },
      })
    },
    async editTopics(values) {
      const objects = values.filter(v => typeof v === 'object')
      const texts = values.filter(v => typeof v === 'string')
      let target = objects.length
      texts.forEach((wholeString) => {
        const topicNames = wholeString.split(',').map(n => n.trim())
        target += topicNames.length
        const hashmap = Object.fromEntries(this.allTopics.map(t => [t.name, t.id]))
        const knownNames = Object.keys(hashmap)
        topicNames.forEach(async (name) => {
          if (knownNames.includes(name)) {
            objects.push({ name, id: hashmap[name] })
          } else {
            const { data: { insert_topic_one: { id } } } = await this.$apollo.mutate({
              mutation: require('~/graphql/AddTopic'),
              variables: { name },
            })
            console.log('THE TOPIC "' + name + ' was successfully added with id ' + id)
            objects.push({ id, name })
          }
        })
      })
      console.log('Waiting until all array items have been pushed')
      while (objects.length < target) { // eslint-disable-line no-unmodified-loop-condition
        await new Promise((resolve) => { setTimeout(resolve, 250) })
      }
      console.log('newTopicsList: ', objects)
      this.$apollo.mutate({
        mutation: require('~/graphql/UpdatePhaseTopics'),
        variables: {
          id: this.phase.id,
          topic_whitelist: objects.map(o => o.id),
        },
      })
    },
    editTopicName(index, item) {
      if (!this.editing) {
        this.editing = item
        this.editingIndex = index
      } else {
        this.editing = null
        this.editingIndex = -1
      }
    },
    deleteTopic(item) {
      const { name, id } = item
      if (confirm('Are you sure you want to delete the topic "' + name + '"?')) {
        try {
          this.$db.delete('topic', { id }, null)
        } catch (ex) {
          alert('"' + name + '" could not be deleted.\nProbably the topic is already used somewhere and/or has\nexample student messages defined.')
        }
      }
    },
  },
}
</script>

<style lang="css" scoped />
