<template lang="html">
  <v-list-item>
    <v-menu offset-y>
      <template #activator="{on: menu, attrs}">
        <v-tooltip bottom>
          <template #activator="{on: tooltip}">
            <v-list-item-icon v-bind="attrs" v-on="{...tooltip, ...menu}">
              <v-icon v-text="'mdi-' + type[question.type].icon" />
            </v-list-item-icon>
          </template>
          <span>Click to select an item type</span>
        </v-tooltip>
      </template>
      <v-list subheader>
        <template v-for="t in types">
          <v-subheader v-if="t.name === 'groupSeparator'" :key="t.name + '_' + t.text" v-text="t.text" />
          <v-list-item v-else :key="t.name" @click="changeQuestionType(question, t.name)">
            <v-list-item-icon>
              <v-icon v-text="'mdi-' + t.icon" />
            </v-list-item-icon>
            <v-list-item-title v-text="t.displayName" />
          </v-list-item>
        </template>
      </v-list>
    </v-menu>

    <v-list-item-content>
      <v-list-item-title>
        <template v-if="editingQuestion === question">
          <v-text-field v-if="['input', 'newPage', 'customPage', 'video', 'image'].includes(question.type)" :value="question.question" autofocus @change="editQuestion" @blur="editingQuestion = null" />
          <v-textarea
            v-else-if="question.type === 'description'"
            :value="question.info ? (question.info.paragraphs.join('\n') || question.question) : question.question"
            auto-grow
            rows="1"
            @change="editQuestion"
            @blur="editingQuestion = null"
          />
          <span v-else v-text="question.question" />
        </template>
        <template v-else>
          <strong v-if="['newPage', 'customPage'].includes(question.type)" @click="editQuestion(question)">Page {{ number }}: “{{ question.question }}”</strong>
          <template v-else>
            <span :style="['rateGroup', 'selectChips', 'polarityGroup'].includes(question.type) ? {cursor: 'pointer'} : null" @click="editQuestion(question)"><span v-if="number">Q.{{ number }}: </span>{{ question.question }}</span>
          </template>
        </template>
      </v-list-item-title>

      <v-list-item-subtitle>
        <template v-if="editingNote === question">
          <v-text-field :value="question.note" autofocus @change="editNote" @blur="editingNote = null" />
        </template>
        <span v-else @click="editNote(question)">{{ question.note !== '' ? question.note : 'Add a note' }}</span>
      </v-list-item-subtitle>
    </v-list-item-content>

    <v-tooltip bottom>
      <template #activator="{on, attrs}">
        <v-hover v-slot="{hover}">
          <v-icon class="mx-2" :color="hover ? 'blue' : null" v-bind="attrs" v-on="on" @click="duplicate">
            mdi-content-duplicate
          </v-icon>
        </v-hover>
      </template>
      <span>Duplicate question</span>
    </v-tooltip>

    <v-tooltip bottom>
      <template #activator="{on, attrs}">
        <v-hover v-slot="{hover}">
          <v-icon class="mx-2" :color="hover ? 'red' : null" v-bind="attrs" v-on="on" @click="$emit('delete')">
            mdi-delete
          </v-icon>
        </v-hover>
      </template>
      <span>Delete question</span>
    </v-tooltip>

    <v-dialog :value="editingQuestion === question && question.type === 'rateGroup'" max-width="1400">
      <v-card>
        <v-card-title v-text="'Rate'" />

        <v-card-text>
          <v-container>
            <v-row cols="12">
              <v-col lg="6">
                <v-text-field v-model="editHint" label="Heading" hint="This text will be displayed as the main question/hint for the entire table" persistent-hint />
              </v-col>
              <v-col lg="3">
                <v-text-field v-model="editKey" label="Name" hint="This name will be used to identify answers to this question in the database" persistent-hint />
              </v-col>
              <v-col lg="3">
                <v-checkbox v-model="editWithComment" label="Include comment field" hint="Allow users to share free-text comments on each sub-question" persistent-hint />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <h3>Sub-Questions</h3>
                <string-array-edit v-model="editSubQuestions" />
              </v-col>
              <v-col>
                <h3>Categories</h3>
                <string-array-edit v-model="editCategories" />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="editQuestion">
            Store
          </v-btn>
          <v-btn @click="editingQuestion = null">
            Dismiss
          </v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :value="editingQuestion === question && question.type === 'selectChips'" max-width="1400">
      <v-card>
        <v-card-title v-text="'Select from a list (multiple-choice)'" />

        <v-card-text>
          <v-container>
            <v-row>
              <v-col>
                <v-text-field v-model="editHint" label="Heading" hint="This text will be displayed as the main question/hint for the entire table" persistent-hint />
              </v-col>
              <v-col>
                <v-text-field v-model="editKey" label="Name" hint="This name will be used to identify answers to this question in the database" persistent-hint />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <h3>Options to choose from</h3>
                <string-array-edit v-model="editChips" />
                <v-text-field
                  v-model="editMaxSelect"
                  label="Allow selecting up to "
                  suffix=" items"
                  type="number"
                  min="0"
                  max="100"
                  hint="Select '0' for unlimited selection"
                />
              </v-col>
              </row>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="editQuestion">
            Store
          </v-btn>
          <v-btn @click="editingQuestion = null">
            Dismiss
          </v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :value="editingQuestion === question && question.type === 'polarityGroup'" max-width="1400">
      <v-card>
        <v-card-title v-text="'Polarity question'" />

        <v-card-text>
          <v-container>
            <v-row>
              <v-col>
                <v-text-field v-model="editHint" label="Heading" hint="This text will be displayed as the main question/hint for the entire table" persistent-hint />
              </v-col>
              <v-col>
                <v-text-field v-model="editKey" label="Name" hint="This name will be used to identify answers to this question in the database" persistent-hint />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <h3>Polarities</h3>
                <string-array-edit v-model="editPolarities" />
              </v-col>
              </row>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="editQuestion">
            Store
          </v-btn>
          <v-btn @click="editingQuestion = null">
            Dismiss
          </v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-list-item>
</template>

<script>
export default {
  props: {
    question: {
      type: Object,
      required: true,
    },
    number: {
      type: Number,
      default: null,
    },
    surveyId: {
      type: String,
      required: true,
    },
  },
  emits: [
    'delete',
    'change-type',
  ],
  data: () => ({
    editingQuestion: null,
    editingNote: null,
    editHint: '',
    editKey: '',
    editWithComment: false,
    editCategories: [],
    editSubQuestions: [],
    editPolarities: [],
    editChips: [],
    editMaxSelect: 0,
    types: [
      {
        name: 'groupSeparator',
        text: 'Structure',
      },
      {
        name: 'newPage',
        displayName: 'Page break',
        icon: 'format-page-break',
      },
      {
        name: 'description',
        displayName: 'Descriptive text',
        icon: 'text',
      },
      {
        name: 'video',
        displayName: 'Video',
        icon: 'video',
      },
      {
        name: 'image',
        displayName: 'Image or GIF',
        icon: 'image-outline',
      },
      {
        name: 'groupSeparator',
        text: 'Question types',
      },
      {
        name: 'input',
        displayName: 'Text Input',
        icon: 'form-textarea',
      },
      {
        name: 'rateGroup',
        displayName: 'Rate one or more items categorically (single-choice)',
        icon: 'grid-large',
      },
      {
        name: 'polarityGroup',
        displayName: 'Position one or more items within a polar range (e.g. “evil/bad”)',
        icon: 'plus-minus-variant',
      },
      {
        name: 'selectChips',
        displayName: 'Select items from a list (multiple-choice)',
        icon: 'hexagon-multiple',
      },
      {
        name: 'groupSeparator',
        text: 'Advanced',
      },
      {
        name: 'customPage',
        displayName: 'Custom page',
        icon: 'web',
      },
    // {
    //   name: 'stars',
    //   displayName: 'Rate with 1–5 stars',
    //   icon: 'star',
    // }
    ],
  }),
  computed: {
    type() {
      const trans = this.types.map(t => [t.name, { displayName: t.displayName, icon: t.icon }])
      const ret = Object.fromEntries(trans)
      if (!ret[this.question.type]) {
        ret[this.question.type] = { displayName: this.question.type, icon: null }
      }
      return ret
    },
  },
  methods: {
    duplicate() {
      const { surveyId } = this
      const { number, question, note, type, info } = this.question
      this.$apollo.mutate({
        mutation: require('~/graphql/AddQuestion'),
        variables: {
          surveyId,
          number: number + 1,
          question,
          note,
          type,
          info,
        },
      })
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
      this.$emit('change-type', t)
    },
    editQuestion(q) {
      const { editingQuestion } = this
      if (editingQuestion) {
        const variables = {
          id: editingQuestion.id,
          question: q,
          type: editingQuestion.type,
          note: editingQuestion.note,
          info: {},
        }
        let info = {}
        switch (editingQuestion.type) {
          case 'input':
            info.hint = q
            break
          case 'description':
            info.paragraphs = q.split('\n')
            variables.question = info.paragraphs[0]
            break
          case 'newPage':
            info.title = q
            break
          case 'customPage':
            info.route = q
            break
          case 'video':
          case 'image':
            info.url = q
            break
          case 'rateGroup':
            info = {
              hint: this.editHint,
              questions: this.editSubQuestions,
              categories: this.editCategories,
              withComment: this.editWithComment,
            }
            variables.question = this.editKey === '' ? 'Question ' + editingQuestion.number : this.editKey
            break
          case 'selectChips':
            info = {
              hint: this.editHint,
              chips: this.editChips,
            }
            if (this.editMaxSelect > 0) {
              info.maxSelect = this.editMaxSelect
            }
            variables.question = this.editKey === '' ? 'Question ' + editingQuestion.number : this.editKey
            break
          case 'polarityGroup':
            info = {
              hint: this.editHint,
              polarities: this.editPolarities.map(p => p.split('/').map(s => s.trim())),
              scale: [-100, 100],
              step: 10,
            }
            variables.question = this.editKey === '' ? 'Question ' + editingQuestion.number : this.editKey
            break
        }
        Object.assign(variables.info, info)
        this.$apollo.mutate({
          mutation: require('~/graphql/UpdateQuestion'),
          variables,
        })
        this.editingQuestion = null
      } else {
        if (q.info) {
          switch (q.type) {
            case 'rateGroup':
              this.editCategories = [...q.info.categories]
              this.editSubQuestions = [...q.info.questions]
              this.editWithComment = !!q.info.withComment
              break
            case 'selectChips':
              this.editChips = [...q.info.chips]
              this.editMaxSelect = q.info.maxSelect
              break
            case 'polarityGroup':
              this.editPolarities = [...q.info.polarities.map(p => p.join('/'))]
              break
          }
          this.editHint = q.info.hint
        }
        this.editKey = q.question
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
  },
}
</script>

<style lang="css" scoped>
</style>
