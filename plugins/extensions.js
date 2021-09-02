/* eslint-disable-next-line no-extend-native */
String.prototype.toCamelCase = function () {
  return this.substr(0, 1).toUpperCase() + this.substr(1)
}
