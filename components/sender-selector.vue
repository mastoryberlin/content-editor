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
          :src="`/npcs/${senderId.toLowerCase()}.png`"
          :alt="senderId"
        >
      </v-avatar>
    </template>
    <v-card>
      <v-container>
        <v-hover
          v-for="m in Object.keys(senderIds).filter(k => k != senderId)"
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
                      :src="`/npcs/${m.toLowerCase()}.png`"
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
  <!-- <v-btn-toggle
      :value="Object.keys(senderIds).indexOf(senderId)"
      @change="senderId = Object.keys(senderIds)[$event]"
    >
      <v-btn
        v-for="t in Object.keys(senderIds)"
        :key="t"
        :disabled="disabled"
        class="sender-selector-option"
      >
        {{ senderIds[t].icon }}

        <span v-show="senderId === t" v-text="senderIds[t].tooltip" />
      </v-btn>
    </v-btn-toggle>
  </div> -->
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
