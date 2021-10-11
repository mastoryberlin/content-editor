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
            <v-overlay v-if="disabled" opacity="0" absolute />
            <div v-html="customWrapper" />

            <!-- This is the GeoGebra applet to display the uploaded worksheet -->
            <!-- <div :id="'ggb-' + id" /> -->
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
            <label>Modify this HTML code to create a custom wrapper page for the GeoGebra applet:</label>
            <v-menu
              offset-y
              :disabled="disabled"
            >
              <template #activator="{on, attrs}">
                <v-btn v-bind="attrs" v-on="on">
                  <v-icon>mdi-menu</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item v-for="item in htmlMenu" :key="item.title" @click="item.action">
                  <v-list-item-title v-text="item.title" />
                </v-list-item>
              </v-list>
            </v-menu>
            <prism-editor
              v-model="html"
              :readonly="disabled"
              :highlight="highlighter"
              class="content-editor-worksheet-html"
              @blur="updateHTML"
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
/* global setupInteractions */

// import Prism Editor
import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css' // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-markup'
import 'prismjs/themes/prism-tomorrow.css'
import he from 'he'

export default {
  components: {
    PrismEditor,
  },
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
  data() {
    return {
      file: null,
      geogebra: null,
      forceUpdate: false,
      applet: null,
      liveHTML: null,
      htmlMenu: [
        { title: 'Insert button', action: () => { this.insertHTML('button') } },
        { title: 'Insert number input', action: () => { this.insertHTML('number input') } },
        { title: 'Insert range input', action: () => { this.insertHTML('range input') } },
        { title: 'Insert text input', action: () => { this.insertHTML('text input') } },
        { title: 'Reset', action: this.clearHTML },
      ],
    }
  },
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
    customWrapper() {
      const { html, id } = this
      const preview = html.replace('id="ggb-element"', 'id="ggb-' + id + '" class="ggb-applet"')
      try {
        const script = html
          .match(/(?<=<script>)(?:(?:.|\n)*)(?=<\/script>)/gmi)
          .toString()
          .replace(
            'function setupInteractions(',
            'if (undefined === this.setupInteractions) {this.setupInteractions = {}}; this.setupInteractions["' + id + '"] = function setupInteractions('
          )
        const fn = Function(script) // eslint-disable-line no-new-func
        fn()
      } catch (err) {
        console.log(err)
      }
      return preview
    },
    html: {
      get() {
        const doc = this.worksheet.document
        const defaultHTML =
          '<div id="ggb-element"></div> <!-- This div is mandatory within the HTML wrapper, as the mobile app will inject GeoGebra applet here --> \n' +
          '<div id="ggb-interactions">\n' +
          '  <script>\n' +
          '  function setupInteractions(ggbApplet) {\n' +
          '  }\n' +
          '  <' + '/script>\n' + // Have to split up script tag or else ESLint + Nuxt get confused
          '</div>'
        return this.liveHTML || doc || defaultHTML
      },
      set(v) {
        this.liveHTML = v
      },
    },
  },
  mounted() {
    const { id, html, worksheet: { ggb } } = this
    const params = {
      id: 'ggbApplet-' + id,
      language: 'en',
      scaleContainerClass: 'ggb-applet',
      country: 'US',
      appletOnLoad: (api) => {
        this.geogebra = api
        const script = he.unescape(
          he.escape(html)
            .match(/(?<=&lt;script&gt;)(?:(?:.|\n)*)(?=&lt;\/script&gt;)/gm)
            .toString()
        ).replace('function setupInteractions(', 'if (undefined === this.setupInteractions) {this.setupInteractions = {}}; this.setupInteractions["' + id + '"] = function setupInteractions(')
        try {
          const fn = Function(script) // eslint-disable-line no-new-func
          fn()
        } catch (err) {
          console.log(err)
        }

        if (setupInteractions && setupInteractions[id]) { // eslint-disable-line no-undef
          try {
            setupInteractions[id](api) // eslint-disable-line no-undef
          } catch (err) {
            console.log(err)
          }
        }
      },
    }
    if (ggb) {
      params.ggbBase64 = ggb
    }
    const applet = new GGBApplet(params, true)
    applet.inject('ggb-' + id)
    this.applet = applet
  },
  methods: {
    insertHTML(elementType) {
      const id = prompt('Please enter an ID for the new ' + elementType + ':')
      if (id) {
        let html = '<' + elementType + ' id="' + id + '"'
        let js = id + '.addEventListener('
        switch (elementType) {
          case 'button':
            html += '>Click me!</button>'
            js += "'click', () => {\n      ggbApplet.evalCommand('P_{" + id + "} = (0, 0)')\n    })"
            break
          case 'number input':
            html = html.replace('number input', 'input type="number"') + ' min="-10" max="10" value="0">'
            js += "'change', (e) => {\n      const myNumber = e.target.value\n      ggbApplet.evalCommand('P_{" + id + "} = (0, ' + myNumber + ')')\n    })"
            break
          case 'range input':
            html = html.replace('range input', 'input type="range"') + ' min="-10" max="10" step="0.01" value="0">'
            js += "'input', (e) => {\n      const myNumber = e.target.value\n      ggbApplet.evalCommand('P_{" + id + "} = (0, ' + myNumber + ')')\n    })"
            break
          case 'text input':
            html = html.replace('number input', 'input type="text"') + '>'
            js += "'change', (e) => {\n      const myText = e.target.value\n    })"
            break
          default:
            html += '></' + elementType + '>'
            js = ''
        }
        this.liveHTML = this.html
          .replace(/(<script>)/i, html + '\n  $1')
          .replace(/(}\n\s*<\/script>)/i, '  var ' + id + ' = document.getElementById(\'' + id + '\')\n    ' + js + '\n  $1')
        this.updateHTML()
      }
    },
    updateHTML() {
      this.$apollo.mutate({
        mutation: require('~/graphql/UpdateWorksheetDocument'),
        variables: {
          id: this.id,
          document: this.liveHTML,
        },
      })
    },
    highlighter(code) {
      const scriptParts = he.escape(code)
        .match(/(?<=&lt;script&gt;)(?:(?:.|\n)*)(?=&lt;\/script&gt;)/gmi)
      code = highlight(code, languages.markup, 'html')
      if (scriptParts) {
        scriptParts.forEach((js) => {
          js = he.unescape(js)
          code = code.replace(js, highlight(js, languages.js))
        })
      }
      return code // returns html
    },
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
    clearHTML() {
      if (confirm(
        'Are you sure you want to reset the custom HTML wrapper?\n' +
        'Any HTML code entered so far will be permanently lost!'
      )) {
        this.html = null
        this.liveHTML = null
      }
    },
  },
}
</script>

<style lang="sass" scoped>
</style>
