<template lang="html">
  <div class="type-selector-wrapper">
    <span>This block represents a&nbsp;</span>
    <span v-if="disabled">a nestable logic block</span>
    <v-btn-toggle
      v-else
      :value="indexOfType"
      :disabled="disabled"
      @change="type = typeNames[$event]"
    >
      <!-- class="type-selector-type" -->
      <v-btn
        v-for="t in typeNames"
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
    },
    disabled: {
      type: Boolean,
      default: false
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
    }
  }),
  computed: {
    typeNames () {
      return Object.keys(this.types)
    },
    displayType () {
      return 'This message has the type ' + this.message.type
    },
    indexOfType () {
      return this.typeNames.indexOf(this.type)
    },
    type: {
      get () {
        return this.message.type
      },
      set (v) {
        const my = this.message
        if (v && v !== my.type) {
          if (v === 'nestable') {
            // Change from message type to logic block
            this.$db.add('message', null, {
              sender_id: my.sender_id,
              type: my.type,
              text: my.text,
              attachment: my.attachment,
              parent: my.id
            }, my.section_id)
          } else if (my.type === 'nestable') {
            // Change FROM logic block to some message type
            // TODO
          }
          this.$apollo.mutate({
            mutation: require('~/graphql/UpdateMessageType'),
            variables: {
              id: my.id,
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
