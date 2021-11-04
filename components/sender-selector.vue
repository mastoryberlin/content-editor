<template lang="html">
  <v-menu
    bottom
    offset-y
  >
    <template #activator="menuActivator">
      <v-avatar
        v-bind="menuActivator.attrs"
        v-on="menuActivator.on"
      >
        <img
          :src="npcs[senderId]"
          :alt="senderId"
        >
      </v-avatar>
    </template>
    <v-card>
      <v-container>
        <v-hover
          v-for="m in npcsAvailableInThisPhase.filter(k => k != senderId)"
          v-slot="{hover}"
          :key="m"
        >
          <v-row
            no-gutters
            class="pa-3"
            :class="hover ? 'mood-selector-mood-hover' : null"
          >
            <v-col
              cols="12"
              @click="senderId = m"
            >
              <v-tooltip top>
                <template #activator="npcSelectorActivator">
                  <v-avatar
                    v-bind="npcSelectorActivator.attrs"
                    size="48"
                    v-on="npcSelectorActivator.on"
                  >
                    <v-img
                      :src="npcs[m]"
                      :alt="m"
                    />
                  </v-avatar>
                </template>
                <span v-text="m" />
              </v-tooltip>
            </v-col>
          </v-row>
        </v-hover>
      </v-container>
    </v-card>
  </v-menu>
</template>

<script>
import {mapGetters} from 'vuex'
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
    npcsAvailableInThisPhase: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
    open: false,
  }),
  computed: {
    ...mapGetters('story', [
      'npcs'
    ]),
    senderId: {
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
