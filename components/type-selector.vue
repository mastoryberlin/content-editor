<template lang="html">
  <div class="type-selector-wrapper">
    <span>This block represents a&nbsp;</span>
    <span v-if="disabled">a nestable logic block. You cannot change its type as long as multiple messages belong to it.</span>
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
      required: true,
    },
    children: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    types: {
      text: {
        tooltip: 'Text message',
        icon: 'mdi-message-text',
        color: 'blue',
      },
      image: {
        tooltip: 'Image message',
        icon: 'mdi-message-image',
        color: 'orange',
      },
      video: {
        tooltip: 'Video message',
        icon: 'mdi-youtube',
        color: 'red',
      },
      audio: {
        tooltip: 'Audio message',
        icon: 'mdi-microphone',
        color: 'green',
      },
      nestable: {
        tooltip: 'Nestable logic block',
        icon: 'mdi-arrow-decision',
        color: 'purple lighten-3',
      },
    },
  }),
  computed: {
    disabled() {
      const children = this.children
      return !!children && children.length > 1
    },
    typeNames() {
      return Object.keys(this.types)
    },
    displayType() {
      return 'This message has the type ' + this.message.type
    },
    indexOfType() {
      return this.typeNames.indexOf(this.type)
    },
    type: {
      get() {
        return this.message.type
      },
      set(v) {
        const my = this.message
        if (v && v !== my.type) {
          if (v === 'nestable') {
            // Change from message type to logic block
            this.$db.add('message', null, {
              sender_id: my.sender_id,
              type: my.type,
              text: my.text,
              attachment: my.attachment,
              parent: my.id,
            }, my.section_id)
          } else if (my.type === 'nestable') {
            // Change FROM logic block to some message type
            // This is only possible for nestables with a single child msg.
            const child = this.children[0]
            this.$apollo.mutate({
              mutation: require('~/graphql/UpdateMessage'),
              variables: {
                id: my.id,
                logic: [my.logic, child.logic].filter(l => l !== '').join('\n'),
                type: child.type,
                text: child.text,
                attachment: child.attachment,
                senderId: child.sender_id,
              },
            })
            this.$apollo.mutate({
              mutation: require('~/graphql/DeleteMessage'),
              variables: {
                id: child.id,
                number: child.number,
                phaseId: my.section_id,
              },
            })
          }
          this.$apollo.mutate({
            mutation: require('~/graphql/UpdateMessageType'),
            variables: {
              id: my.id,
              type: v,
            },
          })
        }
      },
    },
  },
}
</script>

<style lang="sass">
.type-selector
  &-wrapper, &-dial
    position: relative
    display: inline-block
</style>
