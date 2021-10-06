<template>
  <v-card class="ma-7">
    <v-card-title v-if="title">
      {{ title }}
      <v-tooltip bottom>
        <template #activator="{on, attrs}">
          <v-hover v-slot="{hover}">
            <v-icon class="mx-7" :color="hover ? 'red' : null" v-bind="attrs" v-on="on" @click="deleteSurvey">
              mdi-delete
            </v-icon>
          </v-hover>
        </template>
        <span>Delete this survey</span>
      </v-tooltip>
    </v-card-title>

    <v-card-text>
      <v-list two-lines>
        <v-list-item v-for="question in questions" :key="question.id">
          <v-menu offset-y>
            <template #activator="{on: menu, attrs}">
              <v-tooltip bottom>
                <template #activator="{on: tooltip}">
                  <v-list-item-icon v-bind="attrs" v-on="{...tooltip, ...menu}">
                    <v-icon v-text="'mdi-' + type[question.type].icon" />
                  </v-list-item-icon>
                </template>
                <span>Click to select a different type of question</span>
              </v-tooltip>
            </template>
            <v-list>
              <v-list-item v-for="t in types" :key="t.name" @click="changeQuestionType(question, t.name)">
                <v-list-item-icon>
                  <v-icon v-text="'mdi-' + t.icon" />
                </v-list-item-icon>
                <v-list-item-title v-text="t.displayName" />
              </v-list-item>
            </v-list>
          </v-menu>

          <v-list-item-content>
            <v-list-item-title>
              <v-text-field v-if="editingQuestion === question" :value="question.question" autofocus @change="editQuestion" @blur="editingQuestion = null" />
              <template v-else>
                <span @click="editNumber(question)">({{ question.number }})</span> <span @click="editQuestion(question)">{{ question.question }}</span>
              </template>
            </v-list-item-title>

            <v-list-item-subtitle>
              <v-text-field v-if="editingNote === question" :value="question.note" autofocus @change="editNote" @blur="editingNote = null" />
              <span v-else @click="editNote(question)">{{ question.note !== '' ? question.note : 'Click here to add a note' }}</span>
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-tooltip bottom>
            <template #activator="{on, attrs}">
              <v-hover v-slot="{hover}">
                <v-icon :color="hover ? 'red' : null" v-bind="attrs" v-on="on" @click="deleteQuestion(question)">
                  mdi-delete
                </v-icon>
              </v-hover>
            </template>
            <span>Delete question</span>
          </v-tooltip>
        </v-list-item>
      </v-list>

      <v-text-field
        ref="addQuestionField"
        v-model="questionToAdd"
        label="Enter the next question here"
        :hint="'The question will initially be of type \'' + type[nextType].displayName
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
export default {
  props: {
    survey: {
      type: Object,
      required: true,
    },
    number: {
      type: Number,
    },
  },
  emits: [
    'add-survey',
  ],
  data: () => ({
    questionToAdd: '',
    editingQuestion: null,
    editingNote: null,
    types: [{
      name: 'text',
      displayName: 'Free Text Input',
      icon: 'form-textarea',
    },
    {
      name: 'scale',
      displayName: 'Judge on a scale between 1 and 7',
      icon: 'numeric',
    },
    {
      name: 'stars',
      displayName: 'Rate with 1–5 stars',
      icon: 'star',
    }],
  }),
  computed: {
    id() {
      return this.survey.id
    },
    title() {
      if (undefined === this.number) {
        return null
      } else {
        const letter = String.fromCharCode(this.number + 65)
        return 'Survey ' + letter
      }
    },
    nextType() {
      return this.questionsCount > 0
        ? this.questions[this.questionsCount - 1].type
        : 'text'
    },
    type() {
      const trans = this.types.map(t => [t.name, { displayName: t.displayName, icon: t.icon }])
      return Object.fromEntries(trans)
    },
    questions() {
      return this.survey.questions
    },
    questionsCount() {
      return this.questions.length
    },
  },
  methods: {
    deleteSurvey() {
      if (confirm('Are you sure you want to delete this survey? This will also delete all questions irreversibly!')) {
        const variables = {
          id: this.id,
        }
        this.$db.delete('survey', variables, null)
      }
    },
    addQuestion() {
      const variables = {
        survey_id: this.id,
        number: this.questionsCount + 1,
        question: this.questionToAdd,
        type: this.nextType,
      }
      this.$db.add('question', null, variables, null) // TODO: no need parent
      this.$refs.addQuestionField.$refs.input.select()
    },
    deleteQuestion(q) {
      if (confirm('Are you sure you want to delete Question ' + q.number + '?')) {
        const variables = {
          id: q.id,
          number: q.number,
        }
        this.$db.delete('question', variables, this.id)
      }
    },
    changeQuestionType(q, t) {
      this.$apollo.mutate({
        mutation: require('~/graphql/UpdateQuestion'),
        variables: {
          id: q.id,
          question: q.question,
          type: t,
          note: q.note,
        },
      })
    },
    editQuestion(q) {
      const editingQuestion = this.editingQuestion
      if (editingQuestion) {
        this.$apollo.mutate({
          mutation: require('~/graphql/UpdateQuestion'),
          variables: {
            id: editingQuestion.id,
            question: q,
            type: editingQuestion.type,
            note: editingQuestion.note,
          },
        })
        this.editingQuestion = null
      } else {
        this.editingQuestion = q
      }
    },
    editNote(q) {
      const editingNote = this.editingNote
      if (editingNote) {
        this.$apollo.mutate({
          mutation: require('~/graphql/UpdateQuestion'),
          variables: {
            id: editingNote.id,
            question: editingNote.question,
            type: editingNote.type,
            note: q,
          },
        })
        this.editingNote = null
      } else {
        this.editingNote = q
      }
    },
    editNumber(q) {
      const newNumber = prompt('Enter the new number of this question')
      if (newNumber) {
        this.$apollo.mutate({
          mutation: require('~/graphql/MoveQuestion'),
          variables: {
            id: q.id,
            survey_id: this.id,
            from: q.number,
            to: newNumber,
          },
        })
      }
    },
  },
}
</script>

<style lang="sass" scoped>
</style>
