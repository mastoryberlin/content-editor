<template lang="html">
  <div class="">
    <iframe
      ref="iframe"
      :width="size[0] - 5"
      :height="size[1] - 5"
      :srcdoc="srcDoc"
    >
      <p>
      HTML iframes are disabled but needed for worksheet preview. Please update your browser.
      </p>
    </iframe>
    <v-btn fab color="blue" @click="refresh">
      <v-icon>mdi-refresh</v-icon>
    </v-btn>
  </div>
</template>

<script>
const previewHTML = `<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta charset="utf-8"/>
    <script src="https://www.geogebra.org/apps/deployggb.js"></` + `script>
    <style>
    body {
      margin: 0;
    }

    #loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
    /* #ggb-element {
       height: screen.heightpx;
     } */
    </style>
  </head>
  <body>
    <div id="loading">Loading worksheet</div>
    <!-- DOCUMENT -->
    <script>
    // make sure we can inject geogebra applet
    var ggbElement = document.querySelector('#ggb-element');
    if (ggbElement == null) {
      var body = document.querySelector('body');
      var ggbElement = document.createElement('div');
      ggbElement.id = 'ggb-element';
      body.prepend(ggbElement);
    }

    var ggbInteractions = document.querySelector('#ggb-interactions');
    var ggbInteractionsHeight = ggbInteractions.getBoundingClientRect().height;

    // See: https://wiki.geogebra.org/en/Reference:GeoGebra_App_Parameters
    var params = {
      appName: "classic", // graphing, geometry or 3d
      width: screen.width,
      height: screen.height - ggbInteractionsHeight,
      /*SHOWTOOLBAR*/
      showAlgebraInput: false,
      showMenuBar: false,
      showAlgebraInput: false,
      borderColor: "#ffffff",
      showResetIcon: false,
      /*CUSTOMTOOLBAR*/
      capturingThreshold: 3,
      appletOnLoad: appletOnLoad,
      /*GGBBASE64*/
    };
    var applet = new GGBApplet(params, true);

    function appletOnLoad(api) {
      var loading = document.querySelector('#loading');
      if (loading != null) {
        loading.style.display = 'none';
      }

      if (typeof window.setupInteractions === "function") {
        window.setupInteractions(api);
      }
    }

    window.addEventListener("load", function() {
      // Fix a specific version: web, web3d, webSimple
      applet.setHTML5Codebase("https://www.geogebra.org/apps/5.0.654.0/web");
      applet.inject('ggb-element');
    });

    </` + `script>
  </body>
</html>`

export default {
  props: {
    size: {
      type: Array,
      default: () => ([300, 300]),
    },
    ggbBase64: {
      type: String,
      default: null,
    },
    showToolbar: {
      type: Boolean,
      default: true,
    },
    customToolbar: {
      type: String,
      default: null,
    },
    wrapperPage: {
      type: String,
      default: '<div id="ggb-element"></div>' +
      '<div id="ggb-interactions">' +
      '  <script>' +
      '  function setupInteractions(ggbApplet) {}' +
      '  <' + '/script>' + // Have to split up script tag or else ESLint + Nuxt get confused
      '</div>',
    },
  },
  data() {
    const { wrapperPage, ggbBase64, showToolbar, customToolbar, size } = this
    return {
      srcDoc: previewHTML
        .replace('<!-- DOCUMENT -->', wrapperPage)
        .replace('/*GGBBASE64*/', ggbBase64 ? 'ggbBase64: "' + ggbBase64 + '",' : '')
        .replace('/*SHOWTOOLBAR*/', 'showToolBar: ' + showToolbar + ',')
        .replace('/*CUSTOMTOOLBAR*/', customToolbar != null ? 'customToolBar: "' + customToolbar + '",' : '')
        .replaceAll('screen.width', size[0])
        .replaceAll('screen.height', size[1] - 20),
    }
  },
  watch: {
    size(newSize, oldSize) {
      if (newSize !== oldSize) {
        const api = this.$refs.iframe.contentWindow.applet.getAppletObject()
        api.setSize(newSize[0], newSize[1])
      }
    },
    ggbBase64(newGgb, oldGgb) {
      if (newGgb !== oldGgb) {
        const api = this.$refs.iframe.contentWindow.applet.getAppletObject()
        api.setBase64(newGgb)
      }
    },
    showToolbar(newShow, oldShow) {
      if (newShow !== oldShow) {
        const api = this.$refs.iframe.contentWindow.applet.getAppletObject()
        api.showToolBar(newShow)
      }
    },
    customToolbar(newCustom, oldCustom) {
      if (newCustom !== oldCustom) {
        const api = this.$refs.iframe.contentWindow.applet.getAppletObject()
        api.setCustomToolBar(newCustom)
      }
    },
    wrapperPage(newHTML, oldHTML) {
      const ggbRegex = /<div\s+id="ggb-element"\s*(?:><\/div>|\/>)/
      const [oldBefore, oldAfter] = oldHTML.split(ggbRegex)
      const [newBefore, newAfter] = newHTML.split(ggbRegex)
      const parser = new DOMParser()
      let doc, nodes, fragBefore, fragAfter
      const exchangeBefore = newBefore !== oldBefore
      const exchangeAfter = newAfter !== oldAfter

      if (exchangeBefore) {
        doc = parser.parseFromString(newBefore, 'text/html')
        nodes = doc.body.childNodes
        fragBefore = new DocumentFragment()
        fragBefore.append(...nodes)
        console.log('exchanged before', newBefore)
      }
      if (exchangeAfter) {
        doc = parser.parseFromString(newAfter, 'text/html')
        nodes = doc.body.childNodes
        fragAfter = new DocumentFragment()
        fragAfter.append(...nodes)
        console.log('exchanged after', newAfter)
      }

      doc = this.$refs.iframe.contentDocument.body
      const array = [...doc.children]
      let ggbElement = null
      for (const node of array) {
        if (node.id === 'ggb-element') {
          ggbElement = node
        } else if ((!ggbElement && exchangeBefore) || (!!ggbElement && exchangeAfter)) {
          doc.removeChild(node)
        }
      }

      if (exchangeBefore) { doc.insertBefore(fragBefore, ggbElement) }
      if (exchangeAfter) { doc.appendChild(fragAfter) }
    },
  },
  methods: {
    refresh() {
      const { wrapperPage, ggbBase64, showToolbar, customToolbar, size } = this
      this.$refs.iframe.srcdoc = previewHTML
        .replace('<!-- DOCUMENT -->', wrapperPage)
        .replace('/*GGBBASE64*/', ggbBase64 ? 'ggbBase64: "' + ggbBase64 + '",' : '')
        .replace('/*SHOWTOOLBAR*/', 'showToolBar: ' + showToolbar + ',')
        .replace('/*CUSTOMTOOLBAR*/', customToolbar != null ? 'customToolBar: "' + customToolbar + '",' : '')
        .replaceAll('screen.width', size[0])
        .replaceAll('screen.height', size[1] - 20)
    },
  },
}
</script>

<style lang="css" scoped>
</style>
