export default (context, inject) => {
  inject('test', {
    start(classObject) {
      console.log('start alpha test for class ' + classObject.id)
    },
    stop(classObject) {
      console.log('stop alpha test for class ' + classObject.id)
    },
    reset(classObject) {
      console.log('reset alpha test for class ' + classObject.id)
    },
  })
}
