<template lang="html">
  <div class="">
    <p>
      Write the {{ scope }} specs as you wish, then organize them into paragraphs to reflect the division into {{ subscope }}s
    </p>

    <v-textarea
      class="ma-5 text-h6"
      :value="dataObject[field]"
      :label="labelTextField || 'Free-flow description of the ' + scope + ' specs'"
      solo
      rows="1"
      auto-grow
      @change="edit"
      @input="text = $event"
    />

    <template v-if="newCardsCount > 0">
      <p>
        Once you are finished writing, I can generate {{ scope === 'story' ? 'an episode' : 'a phase' }} card from each paragraph above.
      </p>

      <p>
        Please choose a place to insert them:
        <v-radio-group
          v-model="appendPrepend"
          :items="['append', 'prepend']"
        >
          <v-radio :label="'Add generated ' + (scope === 'story' ? 'episode' : 'phase') + ' cards to the end of the existing list'" value="append" />
          <v-radio label="Prepend the existing list with newly generated cards" value="prepend" />
        </v-radio-group>
      </p>

      <p class="text-subtitle-2">
        Your paragraphs will become {{ subscope }}s {{ newCardsDisplayRange }}
      </p>

      <v-btn @click="generateSpecs">
        Generate {{ subscope }}s
      </v-btn>
    </template>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  props: {
    scope: {
      type: String,
      required: true
    },
    dataObject: {
      type: Object,
      required: true
    },
    refId: {
      type: String,
      default: null
    },
    field: {
      type: String,
      required: true
    },
    labelTextField: {
      type: String,
      default: null
    }
  },
  data: () => ({
    text: null,
    appendPrepend: 'append'
  }),
  computed: {
    subscope () {
      return this.scope === 'story' ? 'episode' : 'phase'
    },
    existingCardsCount () {
      switch (this.scope) {
        case 'story': return this.dataObject.chapters.length
        case 'episode': return this.dataObject.sections.length
        default: return 0
      }
    },
    paragraphs () {
      const text = this.text || this.dataObject[this.field]
      return text.split(/\n+/).filter(s => s && !/^\s+$/.test(s))
    },
    newCardsCount () {
      return this.paragraphs.length
    },
    newCardsRange () {
      const begin = this.appendPrepend === 'append'
        ? this.existingCardsCount + 1
        : 1
      const end = begin + this.newCardsCount - 1
      return [begin, end]
    },
    newCardsDisplayRange () {
      const rg = this.newCardsRange
      if (rg[0] >= rg[1]) { return rg[0] } else { return this.newCardsRange.join(' through ') }
    }
  },
  methods: {
    ...mapMutations('autosave', [
      'pushChange'
    ]),
    edit (v) {
      this.pushChange({
        change: {
          mutation: require('~/graphql/Update' + this.scope.toCamelCase() + this.field.toCamelCase()),
          variables: { id: this.refId || this.dataObject.id, [this.field]: v }
        },
        dispatch: this.$store.dispatch
      })
    },
    async generateSpecs () {
      // TODO: Generalize to cover episode specs use case as well
      const scopeId = this.refId
      const firstNumber = this.newCardsRange[0]
      const { data: { insert_story_chapter: { returning } } } = await this.$apollo.mutate({
        mutation: require('~/graphql/AddEpisodes'),
        variables: {
          storyId: scopeId,
          numberToAdd: this.newCardsCount,
          insertAtNumber: firstNumber,
          episodes: this.paragraphs.map((p, i) => ({
            story_id: scopeId,
            number: firstNumber + i,
            title: '',
            description: '',
            specs: p
          }))
        }
      })
      let meta
      if (this.appendPrepend === 'append') {
        const lastEpisode = this.dataObject.chapters[firstNumber - 2]
        const lastPhase = lastEpisode.sections[lastEpisode.sections.length - 1]
        meta = JSON.parse(JSON.stringify(lastPhase.meta))
      } else {
        meta = { mood: { VZ: 'happy', Nick: 'happy', Alicia: 'happy', Professor: 'happy' }, topics: [], features: [], challenges: [] }
      }
      await this.$apollo.mutate({
        mutation: require('~/graphql/AddFirstPhaseForEpisodes'),
        variables: {
          phases: returning.map(episode => ({
            chapter_id: episode.id,
            number: 1,
            title: '',
            specs: '',
            meta
          }))
        }
      })
    }
  }
}
</script>

<style lang="css" scoped>
</style>
