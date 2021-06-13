export default (context, inject) => {
  inject('readstat', (msg) => {
    const charCount = msg.length
    const wordCount = msg.trim() === '' ? 0
      : msg.replace(/(^\s*)|(\s*$)/gi, '')
        .replace(/[ ]{2,}/gi, ' ')
        .replace(/\n /, '\n')
        .split(' ').length
    const readTime = wordCount * 0.0077
    const mins = Math.trunc(readTime)
    const secs = Math.round((readTime - mins) * 60)

    return {
      charCount,
      wordCount,
      readTime: `${mins}:${secs < 10 ? '0' : ''}${secs}`,
    }
  })
}
