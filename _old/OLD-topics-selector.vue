<template>
  <div>
    <div v-if="$apollo.loading">
      <v-skeleton-loader v-for="n in 5" :key="n" type="list-item" />
    </div>

    <div v-else-if="$apollo.error">An error occurred!</div>

    <div v-else>
      <apollo-subscribe-to-more
        :document="require('~/graphql/RefreshTopics')"
        :update-query="refreshAllTopics"
      />
      <p>Topics Whitelist:</p>
      <v-combobox
        v-model="topics"
        :filter="filter"
        :hide-no-data="!search"
        :items="allTopics"
        item-text="name"
        :search-input.sync="search"
        hide-selected
        multiple
        small-chips
      >
        <template #no-data>
          <v-list-item>
            <span class="subheading">Create</span>
            <v-chip color="blue lighten-3" label small>
              {{ search }}
            </v-chip>
          </v-list-item>
        </template>
        <template #selection="{ attrs, item, parent, selected }">
          <v-chip
            v-if="item === Object(item)"
            v-bind="attrs"
            :color="colorFromId(item)"
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
            @keyup.enter="edit(index, item)"
          />
          <v-chip v-else :color="colorFromId(item)" dark label small>
            {{ item.name }}
          </v-chip>
          <v-spacer />
          <v-list-item-action @click.stop>
            <v-btn icon @click.stop.prevent="edit(index, item)">
              <v-icon>{{
                editing !== item ? "mdi-pencil" : "mdi-check"
              }}</v-icon>
            </v-btn>
          </v-list-item-action>
        </template>
      </v-combobox>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    phase: {
      type: Object,
      required: true,
    },
  },
  apollo: {
    allTopics: {
      query: require('~/graphql/GetTopics'),
      update: data => data.topic,
    },
  },
  data: () => ({
    activator: null,
    attach: null,
    colors: ['green', 'purple', 'indigo', 'cyan', 'teal', 'orange', 'yellow', 'green', 'pink', 'blue'],
    editing: null,
    editingIndex: -1,
    allTopics: [],
    // selectedTopics: [],
    menu: false,
    x: 0,
    search: null,
    y: 0,
  }),
  computed: {
    topics: {
      get() {
        return this.phase.topic_whitelist.map((id) => {
          const top = this.allTopics.find(t => t.id === id)
          return {
            id, name: top ? top.name : 'THIS TOPIC WAS DELETED!',
          }
        })
      },
      async set(v) {
        this.$apollo.mutate({
          mutation: require('~/graphql/UpdatePhaseTopics'),
          variables: {
            id: this.phase.id,
            topic_whitelist: await v.map(async (t) => {
              if (t.id) {
                return t.id
              } else if (typeof (t) === 'string') {
                const { data: { insert_topic_one: { id } } } = await this.$apollo.mutate({
                  mutation: require('~/graphql/AddTopic'),
                  variables: { name: t },
                })
                return id
              }
            }),
          },
        })
      },
    },
  },

  // watch: {
  //   selectedTopics (val, prev) {
  //     if (val.length === prev.length) {
  //       console.log('TOPICS WATCHER: Aborting')
  //       return
  //     }
  //
  //     this.selectedTopics = val.map((v) => {
  //       console.log('TOPICS WATCHER', v)
  //       if (typeof v === 'string') {
  //         v = {
  //           name: v
  //         }
  //       }
  //       return v
  //     })
  //   }
  // },

  methods: {
    refreshAllTopics(previousResult, { subscriptionData }) {
      console.log('refreshAllTopics', previousResult, subscriptionData)
      const newResult = { ...previousResult, ...subscriptionData }
      subscriptionData.data.topic.forEach((topic) => {
        const selectedInThisPhase = this.topics.find((t) => {
          if (t && t.id) {
            return t.id === topic.id
          } else {
            return false
          }
        })
        if (selectedInThisPhase) {
          selectedInThisPhase.name = topic.name
        }
      })

      return newResult
    },
    edit(index, item) {
      if (!this.editing) {
        this.editing = item
        this.editingIndex = index
      } else {
        this.editing = null
        this.editingIndex = -1
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
    colorFromId(item) {
      return 'gray lighten-3'
      // if (!item) { return 'gray lighten-3' }
      // const id = item.id
      // if (!id || id === '') { return 'gray lighten-3' }
      // const n = this.colors.length
      // let index = 0
      // for (const char of id) {
      //   index += char.codePointAt(0)
      // }
      // return this.colors[index % n] + ' lighten-3'
    },
  },
}
</script>

  <style lang="css" scoped />
