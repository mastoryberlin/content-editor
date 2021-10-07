<template lang="html">
  <v-card class="ma-7">
    <v-card-title v-if="title">
      {{ title }}
      <v-tooltip bottom>
        <template #activator="{on, attrs}">
          <v-hover v-slot="{hover}">
            <v-icon class="mx-7" :color="hover ? 'red' : null" v-bind="attrs" v-on="on" @click="deleteWorksheet">
              mdi-delete
            </v-icon>
          </v-hover>
        </template>
        <span>Delete this worksheet</span>
      </v-tooltip>
    </v-card-title>

    <v-card-text>
      <v-text-field :disabled="disabled" :value="shortDescription" label="Short description of the worksheet for teachers" @change="shortDescription = $event" />
      <v-textarea :disabled="disabled" :value="longDescription" label="Long description of the worksheet for teachers" @change="longDescription = $event" />
      <v-container>
        <v-row cols="12">
          <v-col md="12" lg="8">
            <div :id="'ggb-' + id" />
          </v-col>
          <v-col md="12" lg="4">
            <v-file-input
              v-model="file"
              :disabled="disabled"
              label="Choose a GeoGebra file (.ggb) to upload it"
              show-size
              accept=".ggb"
              @change="loadGGB"
            />
            <v-autocomplete
              v-model="inputs"
              auto-select-first
              chips
              clearable
              deletable-chips
              multiple
              :disabled="disabled"
              :items="allObjectNames"
              label="Input variables"
              hint="Enter the IDs of all GeoGebra objects in the worksheet which serve as input parameters"
            />
            <v-autocomplete
              v-model="outputs"
              auto-select-first
              chips
              clearable
              deletable-chips
              multiple
              :disabled="disabled"
              :items="allObjectNames"
              label="Output variables"
              hint="Enter the IDs of all GeoGebra objects in the worksheet which serve as output parameters"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>

    <v-btn
      fab
      size="12"
      color="green"
      class="content-editor-draggable-add"
      @click="$emit('add-worksheet')"
    >
      <v-icon color="white">
        mdi-plus
      </v-icon>
    </v-btn>
  </v-card>
</template>

<script>
/* global GGBApplet */

export default {
  props: {
    disabled: {
      type: Boolean,
      default: true,
    },
    worksheet: {
      type: Object,
      required: true,
    },
  },
  emits: [
    'add-worksheet',
  ],
  data: () => ({
    file: null,
    geogebra: null,
    forceUpdate: false,
  }),
  computed: {
    id() {
      return this.worksheet.id
    },
    number() {
      return this.worksheet.number
    },
    title() {
      if (undefined === this.number) {
        return null
      } else {
        const letter = String.fromCharCode(this.number + 64)
        return 'Worksheet ' + letter
      }
    },
    shortDescription: {
      get() {
        return this.worksheet.short_description
      },
      set(v) {
        this.$apollo.mutate({
          mutation: require('~/graphql/UpdateWorksheetMeta'),
          variables: {
            id: this.id,
            short_description: v,
            long_description: this.longDescription,
            inputs: this.inputs,
            outputs: this.outputs,
          },
        })
      },
    },
    longDescription: {
      get() {
        return this.worksheet.long_description
      },
      set(v) {
        this.$apollo.mutate({
          mutation: require('~/graphql/UpdateWorksheetMeta'),
          variables: {
            id: this.id,
            short_description: this.shortDescription,
            long_description: v,
            inputs: this.inputs,
            outputs: this.outputs,
          },
        })
      },
    },
    allObjectNames() {
      const { geogebra, forceUpdate } = this
      if (forceUpdate) {
        // Dummy
      }
      return geogebra ? geogebra.getAllObjectNames() : []
    },
    inputs: {
      get() {
        return this.worksheet.inputs
      },
      set(v) {
        this.$apollo.mutate({
          mutation: require('~/graphql/UpdateWorksheetMeta'),
          variables: {
            id: this.id,
            short_description: this.shortDescription,
            long_description: this.longDescription,
            inputs: v,
            outputs: this.outputs,
          },
        })
      },
    },
    outputs: {
      get() {
        return this.worksheet.outputs
      },
      set(v) {
        this.$apollo.mutate({
          mutation: require('~/graphql/UpdateWorksheetMeta'),
          variables: {
            id: this.id,
            short_description: this.shortDescription,
            long_description: this.longDescription,
            inputs: this.inputs,
            outputs: v,
          },
        })
      },
    },
  },
  mounted() {
    const { id, worksheet: { ggb } } = this
    console.log('Mounted worksheet-card', ggb)
    const params = {
      id: 'ggbApplet-' + id,
      width: 800,
      height: 600,
      language: 'en',
      country: 'US',
      appletOnLoad: (api) => {
        this.geogebra = api
        console.log('Geogebra API object', this.geogebra)
      },
    }
    if (ggb) {
      params.ggbBase64 = ggb
    }
    const applet = new GGBApplet(params, true)
    applet.inject('ggb-' + id)
  },
  methods: {
    deleteWorksheet() {
      if (confirm('Are you sure you want to delete this worksheet?')) {
        const variables = {
          id: this.id,
          challengeId: this.worksheet.challenge_id,
          number: this.number,
        }
        this.$db.delete({ worksheet: true }, 'challenge', variables, this.worksheet.challenge_id)
      }
    },
    loadGGB() {
      const { file, geogebra, forceUpdate } = this
      if (!!file && !!geogebra) {
        console.log('Loading GGB file ' + file.name)
        const reader = new FileReader()
        reader.onload = (e) => {
          const ggbBase64 = btoa(e.target.result)
          geogebra.setBase64(ggbBase64)
          this.$apollo.mutate({
            mutation: require('~/graphql/UpdateWorksheetGgb'),
            variables: {
              id: this.id,
              ggb: ggbBase64,
            },
          })
          this.forceUpdate = !forceUpdate
        }
        reader.readAsBinaryString(file)
      }
    },
  },
}
</script>

<style lang="sass" scoped>
</style>
