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
            <!-- <iframe ref="ggbIFrame" :srcdoc="customWrapper" /> -->
            <div class="my-4">
              <v-select
                v-model="deviceSize"
                class="d-inline-flex"
                :items="deviceSizes"
                label="Emulate device"
                hint="Pick a mobile device here to emulate its screen size"
                persistent-hint
              />
              <v-switch v-model="landscapeMode" class="d-inline-flex mx-5" label="Landscape mode" />
            </div>

            <geoplot-preview
              class="my-4"
              :ggb-base64="ggb"
              :size="previewSize"
              :wrapper-page="html"
              :show-toolbar="worksheet.show_toolbar"
              :custom-toolbar="worksheet.custom_toolbar"
            />

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
            >
              <!-- <template #append-outer>
                <v-tooltip bottom>
                  <template #activator="{on, attrs}">
                    <v-hover v-slot="{hover}">
                      <v-icon v-bind="attrs" :color="hover ? 'blue' : 'grey'" v-on="on" @click="downloadGGB">
                        mdi-download
                      </v-icon>
                    </v-hover>
                  </template>
                  <span>Download as GeoGebra file</span>
                </v-tooltip>
              </template> -->
            </v-file-input>
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

            <v-radio-group v-model="toolbar" label="Show toolbar" row>
              <v-radio value="none" label="None" />
              <v-radio value="default" label="Default" />
              <v-radio value="custom" label="Custom" />
            </v-radio-group>
            <v-text-field v-model="customToolbar" class="mb-7" label="Custom toolbar code" persistent-hint hint="Separate with '|' character; see https://wiki.geogebra.org/en/Reference:Toolbar for a list of codes" />

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
            <div class="">
              <prism-editor
                v-model="html"
                :readonly="disabled"
                :highlight="highlighter"
                class="content-editor-worksheet-html"
                @input="isHTMLChanged = true"
                @blur="updateHTML"
              />
            </div>
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

    <v-alert
      v-if="uploadFailedAlert"
      v-model="uploadFailedAlert.show"
      type="error"
      dismissible
    >
      There was a problem uploading the file:
      {{ uploadFailedAlert.errorMessage }}
    </v-alert>

    <input id="imageUploader" type="file" accept="image/png,image/jpeg,image/gif,image/x-png" style="visibility: hidden;" @change="uploadImage">
    <a id="ggbDownloader" style="visibility: hidden;" />
  </v-card>
</template>

<script>
// /* global GGBApplet */
// /* global setupInteractions */

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
      loading: false,
      uploadFailedAlert: null,
      landscapeMode: false,
      deviceSize: [360, 780],
      rawDeviceSizes: require('~/device-sizes.json'),
      htmlMenu: [
        { title: 'Insert button', action: () => { this.insertHTML('button') } },
        { title: 'Insert number input', action: () => { this.insertHTML('number input') } },
        { title: 'Insert range input', action: () => { this.insertHTML('range input') } },
        { title: 'Insert text input', action: () => { this.insertHTML('text input') } },
        { title: 'Upload image', action: this.pickImageForUpload },
        { title: 'Reset', action: this.clearHTML },
      ],
    }
  },
  computed: {
    storyId() {
      return this.$route.params.story
    },
    ggb() {
      return this.worksheet.ggb
    },
    id() {
      return this.worksheet.id
    },
    deviceSizes() {
      const { rawDeviceSizes } = this
      return rawDeviceSizes
        .sort((deviceA, deviceB) => {
          const areaA = deviceA.value[0] * deviceA.value[1]
          const areaB = deviceB.value[0] * deviceB.value[1]
          return areaA < areaB
            ? -1
            : areaA > areaB ? 1 : 0
        })
        .map((d) => {
          const m = { ...d }
          m.text = d.text + ' (' + d.value[0] + 'x' + d.value[1] + ')'
          return m
        })
    },
    previewSize() {
      const { landscapeMode, deviceSize } = this
      return landscapeMode ? [deviceSize[1], deviceSize[0]] : deviceSize
    },
    number() {
      return this.worksheet.number
    },
    toolbar: {
      get() {
        return this.worksheet.show_toolbar
          ? (this.worksheet.custom_toolbar === null ? 'default' : 'custom')
          : 'none'
      },
      set(v) {
        if (v !== this.toolbar) {
          let ct
          switch (v) {
            case 'none':
            case 'default':
              ct = null
              break
            case 'custom':
              ct = this.customToolbar || ''
              break
          }
          this.$apollo.mutate({
            mutation: require('~/graphql/UpdateWorksheetToolbar'),
            variables: {
              id: this.id,
              show_toolbar: v !== 'none',
              custom_toolbar: ct,
            },
          })
          this.forceUpdate = !this.forceUpdate
        }
      },
    },
    customToolbar: {
      get() {
        return this.worksheet.custom_toolbar
      },
      set(v) {
        if (v !== this.customToolbar) {
          this.$apollo.mutate({
            mutation: require('~/graphql/UpdateWorksheetToolbar'),
            variables: {
              id: this.id,
              show_toolbar: this.toolbar !== 'none',
              custom_toolbar: v,
            },
          })
          this.forceUpdate = !this.forceUpdate
        }
      },
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
      // const { html, id } = this
      // const preview = html.replace('id="ggb-element"', 'id="ggb-' + id + '" class="ggb-applet"')
      // try {
      //   const script = html
      //     .match(/(?<=<script>)(?:(?:.|\n)*)(?=<\/script>)/gmi)
      //     .toString()
      //     .replace(
      //       'function setupInteractions(',
      //       'if (undefined === this.setupInteractions) {this.setupInteractions = {}}; this.setupInteractions["' + id + '"] = function setupInteractions('
      //     )
      //   const fn = Function(script) // eslint-disable-line no-new-func
      //   fn()
      // } catch (err) {
      //   console.log(err)
      // }
      const { html } = this
      const preview = '<!DOCTYPE html>\n<html lang="en" dir="ltr">\n  <head>\n    <meta charset="utf-8">\n  </head>\n  <body onload="setupInteractions">\n' +
        html + '  </body>\n</html>'
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
  methods: {
    insertHTML(elementType, param) {
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
            html = html.replace('text input', 'input type="text"') + '>'
            js += "'change', (e) => {\n      const myText = e.target.value\n    })"
            break
          case 'img':
            html += ' src="' + param + '" style="width: 95%">'
            js = ''
            break
          default:
            html += '></' + elementType + '>'
            js = ''
        }
        this.liveHTML = this.html
          .replace(/(<script>)/i, html + '\n  $1')
          .replace(/(}\n\s*<\/script>)/i, '  var ' + id + ' = document.getElementById(\'' + id + '\')\n    ' + js + '\n  $1')
        this.isHTMLChanged = true
        this.updateHTML()
      }
    },
    updateHTML() {
      if (this.isHTMLChanged) {
        this.$apollo.mutate({
          mutation: require('~/graphql/UpdateWorksheetDocument'),
          variables: {
            id: this.id,
            document: this.liveHTML,
          },
        })
        this.forceUpdate = !this.forceUpdate
        this.isHTMLChanged = false
      }
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
      const { file } = this
      if (file) {
        console.log('Loading GGB file ' + file.name)
        const reader = new FileReader()
        reader.onload = (e) => {
          const ggbBase64 = btoa(e.target.result)
          // geogebra.setBase64(ggbBase64)
          this.$apollo.mutate({
            mutation: require('~/graphql/UpdateWorksheetGgb'),
            variables: {
              id: this.id,
              ggb: ggbBase64,
            },
          })
          this.forceUpdate = !this.forceUpdate
        }
        reader.readAsBinaryString(file)
      }
    },
    // downloadGGB() {
    //   const { worksheet: { ggb } } = this
    //   if (ggb) {
    //     const el = document.getElementById('ggbDownloader')
    //     el.setAttribute('href', 'data:application/zip;charset=utf-8,' + atob(ggb))
    //     el.setAttribute('download', this.title + '.ggb')
    //     el.click()
    //   }
    // },
    clearHTML() {
      if (confirm(
        'Are you sure you want to reset the custom HTML wrapper?\n' +
        'Any HTML code entered so far will be permanently lost!'
      )) {
        this.html = null
        this.liveHTML = null
        this.forceUpdate = !this.forceUpdate
      }
    },
    pickImageForUpload() {
      const el = document.getElementById('imageUploader')
      el.click()
    },
    async uploadImage(e) {
      const files = e.target.files
      if (files) {
        const file = files[0]
        this.loading = true
        const fd = new FormData()
        fd.append('image', file, file.name)
        try {
          const result = await this.$axios.$post('https://' + process.env.NUXT_ENV_PROC_URL + '/content-editor/upload', fd, { params: { c: this.storyId } })
          this.loading = false
          if (result.success) {
            this.insertHTML('img', result.url)
          } else {
            this.uploadFailedAlert = {
              show: true,
              errorMessage: result.msg,
            }
          }
        } catch (ex) {
          this.uploadFailedAlert = {
            show: true,
            errorMessage: JSON.stringify(ex),
          }
        }
      }
    },
  },
}
</script>

<style lang="sass" scoped>
</style>
