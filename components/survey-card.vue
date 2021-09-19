<template lang="html">
  <v-card class="ma-4">
    <v-card-text>
      <v-list>
        <v-list-item v-for="question in questions" :key="question.id">
          <v-list-item-icon>
            <v-icon>mdi-chat-question</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>
              “{{ question.question }}”
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
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
  },
  emits: [
    'add-survey',
  ],
  computed: {
    questions() {
      return this.survey.questions
    },
  },
}
</script>

<style lang="sass" scoped>
</style>
