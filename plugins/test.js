export default (context, inject) => {
  inject('test', {
    async start(classObject) {
      const ver = await context.$axios.$get('https://dev-c-the-cloud.mastory.io/version?class_id=' + classObject.id, { headers: {} })
      console.log('start alpha test for class ' + classObject.id, ver)
    },
    stop(classObject) {
      console.log('stop alpha test for class ' + classObject.id)
    },
    reset(classObject) {
      console.log('reset alpha test for class ' + classObject.id)
    },
  })
}
