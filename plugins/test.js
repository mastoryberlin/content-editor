export default (context, inject) => {
  inject('test', {
    start() {
      console.log("start alpha test")
    },
    stop() {
      console.log("stop alpha test")
    },
    reset() {
      console.log("reset alpha test")
    },
  })
}
