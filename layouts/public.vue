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
.login
  &-page
    display: table
    height: 100%
    margin: 0 auto
  &-wrapper
    display: table-cell
    vertical-align: middle
  &-sheet
    max-width: 400px
    padding: 2em
  &-failed-message
    position: fixed
</style>
