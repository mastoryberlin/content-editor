<template lang="html">
  <div class="">
    <v-btn class="btn btn-info" @click="onPickFile">
      Upload {{ type }}
    </v-btn>
    <input
      ref="fileInput"
      type="file"
      style="display: none"
      :accept="type + '/*'"
      @change="onFilePicked"
    >
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'image'
    }
  },
  emits: ['uploadComplete'],
  data: () => ({
    file: null,
    dataURL: null
  }),
  methods: {
    onPickFile () {
      this.$refs.fileInput.click()
    },
    onFilePicked (event) {
      const file = event.target.files[0]
      const fileReader = new FileReader()
      fileReader.addEventListener('load', async () => {
        this.dataURL = fileReader.result
        await this.$axios.$post('attachment', {
          type: this.type,
          name: file.name,
          data: fileReader.result.replace(/data:[^;]*;base64,/, '')
        })
        this.$emit('uploadComplete', `http://content.mastory.io/editor/the-cloud/attachment/${this.type}/${file.name}`)
      })
      fileReader.readAsDataURL(file)
      this.file = file
    }
  }
}
</script>

<style lang="css" scoped>
</style>
