/**
 * Content
 * =======
 *
 * Injects the 'sonarvior.js' script at the start.
 */

// TODO:
// - currently Firefox Web Extensions implementation can't proces 'chrome.extension.getURL'
//   (e.g. moz-extension://79da20b5-11c1-482f-bb5f-e7e88bde5caf/content.webextensions.js)

var query = {
  proxy: chrome.extension.getURL('proxy.html')
}

var script = document.createElement('script')
script.src = chrome.extension.getURL('sonarvio.js' + stringifyQuery(query))
script.onload = function(){
  this.parentNode.removeChild(this)
}
document.documentElement.appendChild(script) // || (document.head || ...)


/**
 * Prepare strings for transfer
 *
 * @param {object} query -
 */
function stringifyQuery (query) {
  var params = Object.keys(query).map(function (param) {
    return param + '=' + query[param]
  })
  return '?' + (params.length > 1 ? params.join('&') : params[0])
}
