/**
 * Adapter
 * =======
 *
 * Shouldn't actually be necessary anymore. Targeting modern browsers ....
 */

// ~ regular 'fetch' polyfill doesn't work: https://github.com/github/fetch

// import 'isomorphic-fetch' // FIREFOX - problem during the loading, script process
if ('fetch' in window !== true) {
  require('isomorphic-fetch')
}

// polyfill NodeList iteration
if (!NodeList.prototype[Symbol.iterator]) {
  NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator]
}

// TODO:
// - detect + check mandatory features

var win = window

if (!win.URL) {
  win.URL = win.webkitURL || win.msURL || win.oURL
}

if (!win.MediaSource) {
  win.MediaSource = win.WebKitMediaSource
}

// var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

/** setImmediate | using postmessages for execution in the next step **/

// -> https://docs.webplatform.org/wiki/dom/Window/setImmediate

// -> light channel if reallye necessary
//
// if (!win.setImmediate) {
//   win.setImmediate = (function(){
//     var callbacks = []
//     win.addEventListener('message', function handle (e) {
//       if (e.data === 'setImmediate') {
//         callbacks.shift()()
//       }
//     }, true);
//     return function (fn /** params **/) {
//       if (typeof fn !== 'function') throw Error('Invalid Argument')
//       var params = Array.prototype.slice.call(arguments, 1)
//       callbacks.push(function exec(){
//         return fn.apply(fn, params)
//       })
//       win.postMessage('setImmediate', win.location.href)
//     }
//   })()
// }
