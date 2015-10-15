/**
 * Adapter
 * =======
 *
 * Fix cross browser issues.
 */

if ('fetch' in window !== true) {
  require('isomorphic-fetch')
}

// polyfill for NodeList iteration
if (!NodeList.prototype[Symbol.iterator]) {
  NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator]
}

if (!window.URL) {
  window.URL = window.webkitURL || window.msURL || window.oURL
}

if (!window.MediaSource) {
  window.MediaSource = window.WebKitMediaSource
}

if (!window.AudioContext) {
  window.AudioContext = window.webkitAudioContext
}

if (!document.currentScript) {
  // WARNING:
  // - only works as loaded sync, IE < 11 ?
  document.currentScript = (() => {
    const scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1]
  })()
}
