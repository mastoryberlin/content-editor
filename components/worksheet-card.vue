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
      <v-text-field :value="shortDescription" label="Short description of the worksheet for teachers" @change="shortDescription = $event" />
      <v-textarea :value="longDescription" label="Long description of the worksheet for teachers" @change="longDescription = $event" />
      <v-container>
        <v-row cols="12">
          <v-col md="12" lg="8">
            <div :id="'ggb-' + id" />
          </v-col>
          <v-col md="12" lg="4">
            <v-file-input v-model="file" label="Choose a GeoGebra file (.ggb) to upload it" show-size accept=".ggb" @change="loadGGB" />
            <v-text-field :value="inputVariables" label="Input variables" hint="Enter the IDs of all GeoGebra objects in the worksheet which serve as input parameters as a comma-separated list, e.g. A, x, f, B_0" @change="inputVariables = $event" />
            <v-text-field :value="outputVariables" label="Output variables" hint="Enter the IDs of all GeoGebra objects in the worksheet which serve as output parameters as a comma-separated list, e.g. A, x, f, B_0" @change="outputVariables = $event" />
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
    worksheet: {
      type: Object,
      required: true,
    },
    number: {
      type: Number,
      default: 1,
    },
  },
  emits: [
    'add-worksheet',
  ],
  data: () => ({
    file: null,
    geogebra: null,
  }),
  computed: {
    id() {
      return this.worksheet.id
    },
    title() {
      if (undefined === this.number) {
        return null
      } else {
        const letter = String.fromCharCode(this.number + 65)
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
    inputVariables: {
      get() {
        return this.worksheet.inputs.join(', ')
      },
      set(v) {
        this.$apollo.mutate({
          mutation: require('~/graphql/UpdateWorksheetMeta'),
          variables: {
            id: this.id,
            short_description: this.shortDescription,
            long_description: this.longDescription,
            inputs: v.split(/\s*,\s*/),
            outputs: this.outputs,
          },
        })
      },
    },
    outputVariables: {
      get() {
        return this.worksheet.inputs.join(', ')
      },
      set(v) {
        this.$apollo.mutate({
          mutation: require('~/graphql/UpdateWorksheetMeta'),
          variables: {
            id: this.id,
            short_description: this.shortDescription,
            long_description: this.longDescription,
            inputs: this.inputs,
            outputs: v.split(/\s*,\s*/),
          },
        })
      },
    },
  },
  mounted() {
    const { id, worksheet } = this
    const params = {
      appName: 'graphing',
      id: 'ggbApplet-' + id,
      width: 800,
      height: 600,
      appletOnLoad: (api) => {
        const xml = worksheet.document
        if (xml) {
          api.setXML(xml)
        }
        this.geogebra = api
      },
    }
    const geogebra = new GGBApplet(params, true)
    geogebra.inject('ggb-' + id)
  },
  methods: {
    deleteWorksheet() {
      if (confirm('Are you sure you want to delete this worksheet?')) {
        this.$apollo.mutate({
          mutation: require('~/graphql/DeleteWorksheet'),
          variables: {
            id: this.id,
          },
        })
      }
    },
    loadGGB() {
      const { file, geogebra } = this
      if (!!file && !!geogebra) {
        console.log('Loading GGB file ' + file.name)
        const reader = new FileReader()
        reader.onload = (e) => {
          const ggbBase64 = btoa(e.target.result)
          geogebra.setBase64(ggbBase64)
          this.$apollo.mutate({
            mutation: require('~/graphql/UpdateWorksheetDocument'),
            variables: {
              id: this.id,
              document: geogebra.getXML(),
            },
          })
        }
        reader.readAsBinaryString(file)
      }
    },
  },
}
</script>

<style lang="sass" scoped>
</style>
