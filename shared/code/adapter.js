/**
 * Adapter
 * =======
 *
 * Shouldn't actually be necessary anymore. Targeting modern browsers ....
 */

// -> array.includes
import 'babel/polyfill'

// require('isomorphic-fetch');
// import 'fetch'

// crowd-stats  || check for only one polyfill usage - redundancy ?
// only one instance of babel/polyfill is allowed(anonymous function) @ main.js:408t @ main.js:408e @ main.js:1(anonymous function) @ main.js:410e @ main.js:1(anonymous function) @ main.js:1e @ main.js:1t.__esModule.default @ main.js:1(anonymous function) @ main.js:1

// var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;


// polyfill NodeList iteration
if (!NodeList.prototype[Symbol.iterator]) {
  NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator]
}

var win = window

/**
 *  Blob & ObjectURL
 */
if (!win.URL) {
  win.URL = win.webkitURL || win.msURL || win.oURL
}

if (!win.Blob && !win.BlobBuilder) {
  win.BlobBuilder = win.BlobBuilder       ||
                    win.WebKitBlobBuilder ||
                    win.MozBlobBuilder    ||
                    win.MSBlobBuilder     ||
                    win.OBlobBuilder
}

//

if (!win.MediaSource) {
  win.MediaSource = win.WebKitMediaSource
}

/** setImmediate | using postmessages for execution in the next step **/

// -> https://docs.webplatform.org/wiki/dom/Window/setImmediate

if (!win.setImmediate) {
  win.setImmediate = (function(){
    var callbacks = []
    win.addEventListener('message', function handle (e) {
      if (e.data === 'setImmediate') {
        callbacks.shift()()
      }
    }, true);
    return function (fn /** params **/) {
      if (typeof fn !== 'function') throw Error('Invalid Argument')
      var params = Array.prototype.slice.call(arguments, 1)
      callbacks.push(function exec(){
        return fn.apply(fn, params)
      })
      win.postMessage('setImmediate', win.location.href)
    }
  })()
}
