<template lang="html">
  <v-sheet elevation="7">
    <v-alert type="error" prominent>
      <p><strong>{{ title }}</strong></p>
      <p>{{ text }}</p>

      <div class="confirm">
        <v-btn
          class="mb-5"
          @click="$emit('confirm')"
        >
          <v-icon color="green">
            mdi-check-bold
          </v-icon>
          {{ btnText }}
        </v-btn>
      </div>
    </v-alert>
  </v-sheet>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'The specs have changed.'
    },
    text: {
      type: String,
      default: 'Please check all details already written here, make adjustments where necessary, and then confirm that everything is in order by clicking the button below.'
    },
    btnText: {
      type: String,
      default: 'Alright, checked everything!'
    }
  },
  emits: ['confirm']
}
</script>

<style lang="sass" scoped>
.confirm
  text-align: center
</style>
