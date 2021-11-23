<template>
  <v-card class="ma-7">
    <v-card-title>
      <v-textarea
        :value="title"
        class="text-h5"
        filled
        rounded
        full-width
        rows="1"
        auto-grow
        background-color="white"
        label="Enter a title for this survey"
        @change="title = $event"
      >
        <template #append>
          <v-tooltip bottom>
            <template #activator="{on, attrs}">
              <v-hover v-slot="{hover}">
                <v-icon class="mx-2" :color="hover ? 'blue' : null" v-bind="attrs" v-on="on" @click="duplicateSurvey">
                  mdi-content-duplicate
                </v-icon>
              </v-hover>
            </template>
            <span>Duplicate survey</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{on, attrs}">
              <v-hover v-slot="{hover}">
                <v-icon class="mx-2" :color="hover ? 'red' : null" v-bind="attrs" v-on="on" @click="deleteSurvey">
                  mdi-delete
                </v-icon>
              </v-hover>
            </template>
            <span>Delete survey</span>
          </v-tooltip>
        </template>
      </v-textarea>
    </v-card-title>

    <v-card-text>
      <a :href="previewURL" target="_blank">Open a preview</a>
      <v-list two-lines>
        <container @drop="moveQuestion">
          <draggable v-for="question in questions" :key="question.id">
            <survey-question
              :question="question"
              :survey-id="id"
              :number="numberOf(question)"
              @delete="deleteQuestion(question)"
              @change-type="nextType = $event"
            />
          </draggable>
        </container>
      </v-list>

      <v-text-field
        ref="addQuestionField"
        v-model="questionToAdd"
        label="Enter the next question here"
        :hint="'The question will initially be of type \'' + nextType
          + (questionsCount > 0 ? '\' because this was the type of the last question added.' : '\'')
          + ' You can change the question type later by clicking the icon to the left of the question.'"
        persistent-hint
        @keyup.enter.stop.prevent="addQuestion"
      />
      </v-text-field>
    </v-card-text>

    <v-btn
      fab
      size="12"
      color="green"
      class="content-editor-draggable-add"
      @click="$emit('add-survey')"
    >
      <v-icon color="white">
        mdi-plus
      </v-icon>
    </v-btn>
  </v-card>
</template>

<script>
import { Container, Draggable } from 'vue-smooth-dnd'
export default {
  components: {
    Container,
    Draggable,
  },
  props: {
    survey: {
      type: Object,
      required: true,
    },
    number: {
      type: Number,
      default: 1,
    },
  },
  emits: [
    'add-survey',
  ],
  data: () => ({
    questionToAdd: '',
    nextType: 'input',
  }),
  computed: {
    id() {
      return this.survey.id
    },
    episodeId() {
      return this.$route.params.episode
    },
    title: {
      get() {
        return this.survey.title || ''
      },
      set(title) {
        const { id } = this
        this.$apollo.mutate({
          mutation: require('~/graphql/UpdateSurvey'),
          variables: { id, title },
        })
      },
    },
    previewURL() {
      return 'http://' + process.env.NUXT_ENV_FEEDBACK_URL + '/survey/' + this.id + '?p=1&a=preview'
    },
    questions() {
      return this.survey.questions
    },
    questionsCount() {
      return this.questions.length
    },
    pageItems() {
      const { questions, isPageStart } = this
      return questions.filter(q => isPageStart(q))
    },
    questionItems() {
      const { questions, isPageStart, isStructural } = this
      return questions.filter(q => !isPageStart(q) && !isStructural(q))
    },
  },
  methods: {
    isStructural(question) {
      return ['description', 'video', 'image'].includes(question.type)
    },
    isPageStart(question) {
      return ['newPage', 'customPage'].includes(question.type)
    },
    numberOf(question) {
      const { pageItems, questionItems, isPageStart } = this
      const ref = isPageStart(question) ? pageItems : questionItems
      const i = ref.indexOf(question)
      return i >= 0 ? i + 1 : null
    },
    async duplicateSurvey() {
      const variables = { }
      const title = this.survey.title
      if (title) {
        variables.title = title
      }
      const { data: { insert_survey_one: { id } } } = await this.$db.add({ survey: true }, 'episode', null, variables, this.episodeId)
      const questions = this.questions.map((q) => {
        delete q.id
        delete q.__typename
        q.survey_id = id
        return q
      })
      this.$apollo.mutate({
        mutation: require('~/graphql/AddQuestions'),
        variables: { questions },
      })
    },
    deleteSurvey() {
      if (confirm('Are you sure you want to delete this survey? This will also delete all questions irreversibly!')) {
        const variables = {
          id: this.id,
        }
        this.$db.delete({ survey: { question: true } }, null, variables, null)
      }
    },
    addQuestion() {
      const { id, questionsCount, nextType } = this
      let { questionToAdd } = this
      let type = nextType

      const rePage = /^page\b(\s*\d+:?\s*)?/i
      const reInput = /^input\b:?\s*/i
      const reRate = /^rate\b:?\s*/i
      const rePolarity = /^(polar|opp|opposite)\b:?\s*/i
      const reChips = /^(select|chips)\b:?\s*/i
      const reImage = /\.(gif|jpg|jpeg|png)$/i

      const info = {}

      if (questionToAdd.endsWith('.mp4')) {
        type = 'video'
        info.url = questionToAdd
      } else if (reImage.test(questionToAdd)) {
        type = 'image'
        info.url = questionToAdd
      } else if (rePage.test(questionToAdd)) {
        questionToAdd = questionToAdd.replace(rePage, '')
        type = 'newPage'
      } else if (reInput.test(questionToAdd)) {
        questionToAdd = questionToAdd.replace(reInput, '')
        type = 'input'
      } else if (reRate.test(questionToAdd)) {
        questionToAdd = questionToAdd.replace(reRate, '')
        type = 'rateGroup'
      } else if (rePolarity.test(questionToAdd)) {
        questionToAdd = questionToAdd.replace(rePolarity, '')
        type = 'polarityGroup'
      } else if (reChips.test(questionToAdd)) {
        questionToAdd = questionToAdd.replace(reChips, '')
        type = 'selectChips'
      } else if (questionToAdd.startsWith('/')) {
        type = 'customPage'
        info.route = questionToAdd
      }
      const variables = {
        surveyId: id,
        number: questionsCount + 1,
        question: questionToAdd,
        info,
        type,
      }
      this.$db.add({ question: true }, 'survey', null, variables, id) // TODO: no need parent
      this.$refs.addQuestionField.$refs.input.select()
    },
    moveQuestion({ removedIndex, addedIndex }) {
      if (removedIndex === null || addedIndex === null || removedIndex === addedIndex) { return }
      const q = this.questions[removedIndex]
      if (q) {
        this.$apollo.mutate({
          mutation: require('~/graphql/MoveQuestion'),
          variables: {
            id: q.id,
            survey_id: this.id,
            from: q.number,
            to: addedIndex + 1,
          },
        })
      }
    },
    deleteQuestion(q) {
      if (confirm('Are you sure you want to delete Question ' + q.number + '?')) {
        const variables = {
          id: q.id,
          number: q.number,
        }
        this.$db.delete({ question: true }, 'survey', variables, this.id)
      }
    },
  },
}
</script>

<style lang="sass" scoped>
</style>
