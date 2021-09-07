<template lang="html">
  <div class="type-selector-wrapper">
    <span>Message type:&nbsp;</span>
    <v-btn-toggle
      :value="Object.keys(types).indexOf(type)"
      @change="type = Object.keys(types)[$event]"
    >
      <!-- class="type-selector-type" -->
      <v-btn
        v-for="t in Object.keys(types)"
        :key="t"
        class="type-selector-option"
      >
        <v-icon :color="types[t].color">
          {{ types[t].icon }}
        </v-icon>
        <span v-show="type === t" v-text="types[t].tooltip" />
      </v-btn>
    </v-btn-toggle>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    types: {
      text: {
        tooltip: 'Text message',
        icon: 'mdi-message-text',
        color: 'blue'
      },
      image: {
        tooltip: 'Image message',
        icon: 'mdi-message-image',
        color: 'orange'
      },
      video: {
        tooltip: 'Video message',
        icon: 'mdi-youtube',
        color: 'red'
      },
      audio: {
        tooltip: 'Audio message',
        icon: 'mdi-microphone',
        color: 'green'
      },
      nestable: {
        tooltip: 'Nestable logic block',
        icon: 'mdi-arrow-decision',
        color: 'purple lighten-3'
      }
    },
    open: false
  }),
  computed: {
    displayType () {
      return 'This message has the type ' + this.message.type
    },
    type: {
      get () {
        return this.message.type
      },
      set (v) {
        if (v && v !== this.message.type) {
          this.$apollo.mutate({
            mutation: require('~/graphql/UpdateMessageType'),
            variables: {
              id: this.message.id,
              type: v
            }
          })
        }
      }
    }
  }
}
</script>

<style lang="sass">
.type-selector
  &-wrapper, &-dial
    position: relative
    display: inline-block
</style>
