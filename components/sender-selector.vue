<template lang="html">
  <div class="sender-selector-wrapper">
    <span>&nbsp;from&nbsp;</span>
    <v-btn-toggle
      :value="Object.keys(senderIds).indexOf(type)"
      @change="type = Object.keys(senderIds)[$event]"
    >
      <!-- class="type-selector-type" -->
      <v-btn
        v-for="t in Object.keys(senderIds)"
        :key="t"
        :disabled="disabled"
        class="sender-selector-option"
      >
        {{ senderIds[t].icon }}

        <span v-show="type === t" v-text="senderIds[t].tooltip" />
      </v-btn>
    </v-btn-toggle>
  </div>
</template>

<script>
export default {
  props: {
    disabled: {
      type: Boolean,
      default: null,
    },
    message: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    senderIds: {
      Professor: {
        icon: 'professor',
      },
      Alicia: {
        icon: 'alicia',

      },
      Nick: {

        icon: 'nick',

      },
      VZ: {

        icon: 'vz',

      },
    },
    open: false,
  }),
  computed: {
    displayType() {
      return 'This message has the type ' + this.message.type
    },
    type: {
      get() {
        return this.message.sender_id
      },
      set(v) {
        if (v && v !== this.message.sender_id) {
          this.$apollo.mutate({
            mutation: require('~/graphql/UpdateMessageSender'),
            variables: {
              id: this.message.id,
              senderId: v,
            },
          })
        }
      },
    },
  },
}

</script>

<style lang="sass">
.sender-selector
  &-wrapper, &-dial
    position: relative
    display: inline-block
</style>
