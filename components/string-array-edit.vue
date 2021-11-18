<template lang="html">
  <div>
    <container
      class="d-flex flex-wrap"
      @drop="move"
    >
      <draggable
        v-for="item in items"
        :key="item"
      >
        <v-chip
          class="ma-1"
          close
          label
          @click:close="remove(item)"
        >
          {{ item }}
        </v-chip>
      </draggable>
    </container>
    <v-text-field
      v-model="edit"
      label="Add a category"
      @keyup.enter.prevent="add"
    />
  </div>
</template>

<script>
import { Container, Draggable } from 'vue-smooth-dnd'
export default {
  components: {
    Container,
    Draggable,
  },
  props: {
    value: {
      type: Array,
      default: () => ([]),
    },
  },
  emits: ['input'],
  data() {
    return {
      edit: '',
      items: [...this.value],
    }
  },
  methods: {
    add() {
      const { items, edit } = this
      if (!items.includes(edit)) {
        this.edit = ''
        items.push(edit)
        this.$emit('input', items)
      }
    },
    remove(item) {
      const { items } = this
      const i = items.indexOf(item)
      if (i >= 0) {
        items.splice(i, 1)
        this.$emit('input', items)
      }
    },
    move({ removedIndex, addedIndex }) {
      const { items } = this
      const removed = items[removedIndex]
      items.splice(removedIndex, 1)
      items.splice(addedIndex, 0, removed)
      this.$emit('input', items)
    },
  },
}
</script>

<style lang="css" scoped>
</style>
