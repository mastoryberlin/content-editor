<template>
  <v-app>
      <v-main>
        <v-container>
          <nuxt />
        </v-container>
      </v-main>
      <v-footer
        app
      >
        <span>&copy; {{ new Date().getFullYear() }} Mastory</span>
      </v-footer>
  </v-app>
</template>

<script>
// import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>

<style lang="sass">
.content-editor
  padding: 5px
  &-global-state-indicator
    transition: 1s ease-in-out
  &-draggable
    position: relative
    &-sidebar
      display: inline-block
      margin-right: 5px
      max-width: 20px
    &-content
      display: inline-block
    &-title
      display: inline-block
    &-specs
      display: inline-block
      width: 100%
    &-meta
      display: inline-block
      max-width: 20em
    &-add
      position: absolute
      bottom: -24px
      right: 24px
    &-logic
      font-style: italic
  &-specs
    &-fixed
      background: orange
  &-prompts
    display: inline
    &-buttons
      text-align: center
  &-interactions
    &-npc
      display: inline
.login
  &-sheet
    max-width: 400px
    margin: auto auto
    padding: 2em
  &-failed-message
    position: fixed
.v-overlay__content
  text-align: center
  & > p
    font-size: x-large
  & a
    color: lightgray
    transition: 0.2s ease-in
  & a:hover
    color: #ffc24b
    transition: 0.5s ease-out
</style>
