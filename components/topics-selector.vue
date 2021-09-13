<template lang="html">
  <v-row>
    <v-col>
      <template v-if="$apollo.loading">
        <v-skeleton-loader
          v-for="n in 5"
          :key="n"
          type="list-item"
        />
      </template>

      <template v-else-if="$apollo.error">
        An error occurred!
      </template>

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
          <template #append-outer>
            <v-menu>
              <template #activator="{on, attrs}">
                <v-icon v-bind="attrs" v-on="on">
                  mdi-dots-vertical
                </v-icon>
              </template>
              <v-list>
                <v-list-item
                  v-for="(item, index) in menu"
                  :key="index"
                  link
                >
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
      required: true
    },
    episodeId: {
      type: String,
      required: true
    },
    whitelist: {
      type: Array,
      required: true
    }
  },
  apollo: {
    allTopics: {
      query: require('~/graphql/GetTopics'),
      update: data => data.topic
    }
  },
  data () {
    // let topics
    // const whitelist = this.phase.topic_whitelist
    // if (whitelist) {
    //   topics = whitelist.map((t) => {
    //     const top = this.allTopics.find(at => at.id === t)
    //     let ret
    //     if (top) {
    //       ret = { id: t, name: t.name }
    //     } else {
    //       ret = { id: t, name: '' }
    //     }
    //     return ret
    //   })
    // } else {
    //   topics = []
    // }
    return {
      allTopics: [],
      search: null,
      menu: [
        {
          title: 'Copy this list',
          action: this.copy
        },
        {
          title: 'Copy this list over to all subsequent phases',
          action: this.copyToSubsequentPhases
        }
      ]
    }
  },
  computed: {
    topics () {
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
    }
  },

  methods: {
    refreshAllTopics (previousResult, { subscriptionData }) {
      console.log('refreshAllTopics', previousResult, subscriptionData)
      const newQueryResult = subscriptionData.data.topic
      const newResult = { ...previousResult, topic: { ...newQueryResult } }
      return newResult
    },
    filter (item, queryText, itemText) {
      if (item.header) { return false }

      const hasValue = val => val != null ? val : ''

      const text = hasValue(itemText)
      const query = hasValue(queryText)

      return text.toString()
        .toLowerCase()
        .includes(query.toString().toLowerCase())
    },
    copy () {
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
    copyToSubsequentPhases () {
      this.$apollo.mutate({
        mutation: require('~/graphql/UpdateSubsequentPhaseTopics'),
        variables: {
          episode_id: this.episodeId,
          afterNumber: this.phase.number,
          topic_whitelist: this.whitelist
        }
      })
    },
    editTopics (newTopicsList) {
      console.log('BEGIN editTopics VALUE: ', newTopicsList)
      newTopicsList = newTopicsList.map((v) => {
        if (typeof v === 'string') {
          const wholeString = v
          const arr = []
          const names = wholeString.split(',').map(n => n.trim())
          const hashmap = Object.fromEntries(this.allTopics.map(t => [t.name, t.id]))
          const knownNames = Object.keys(hashmap)
          names.forEach((name) => {
            if (knownNames.includes(name)) {
              arr.push({ name, id: hashmap[name] })
            } else {
              this.$apollo.mutate({
                mutation: require('~/graphql/AddTopic'),
                variables: { name: v }
              })
                .then(({ data: { insert_topic_one: { id, name } } }) => {
                  console.log('THE TOPIC "' + name + ' was successfully added with id ' + id)
                  arr.push({ id, name })
                })
            }
          })
          // .then(({ data: { insert_topic_one: { id } } }) => {
          //   const newTopic = this.topics.find(t => t.name === v.name)
          //   if (newTopic) {
          //     newTopic.id = id
          //     console.log('UPDATED newTopic ', this.topics)
          //   } else {
          //     console.log('FAILED to update newTopic - couldn\'t find the name ' + v.name)
          //   }
          // })
          v = arr
        }
        return v
      })
        .flat()
      // this.topics = newTopicsList
      this.$apollo.mutate({
        mutation: require('~/graphql/UpdatePhaseTopics'),
        variables: {
          id: this.phase.id,
          topic_whitelist: newTopicsList.map(t => t.id)
        }
      })
      console.log('END editTopics ', newTopicsList)
    }
  }
}
</script>

<style lang="css" scoped />
