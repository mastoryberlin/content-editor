<template lang="html">
  <div class="type-selector-wrapper">
    <span v-if="disabled">You cannot change the type of this block as long as multiple messages belong to it.</span>
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
        :disabled="disabled"
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
    disabled: {
      type: Boolean,
      default: null,
    },
    message: {
      type: Object,
      required: true,
    },
    phase: {
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
    disabledButton() {
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
        const data = this.phase
        if (v && v !== my.type) {
          if (my.type === 'nestable') {
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
            this.$db.delete({ message: true }, 'phase', child, my.section_id, { parent: my.id, parentIsNull: false })
          }
          this.$apollo.mutate({
            mutation: require('~/graphql/UpdateMessageType'),
            variables: {
              id: my.id,
              type: v,
            },
          })

          // Optimistic
          setTimeout(() => {
            let index = 0
            data.prompts.every((prompt, idx) => {
              index = idx
              if (prompt.id === my.id) {
                return false
              }
              return true
            })
            data.prompts[index].type = v
          }, 150)

          if (v === 'nestable') {
            // Change from message type to logic block
            const variables = {
              sender_id: my.sender_id,
              type: my.type,
              text: my.text,
              attachment: my.attachment,
              parent: my.id,
              parentIsNull: false,
            }
            this.$db.add({ message: true }, 'phase', null, variables, my.section_id)

            // Optimistic
            setTimeout(() => {
              data.prompts.push(variables)
            }, 150)
          }
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
