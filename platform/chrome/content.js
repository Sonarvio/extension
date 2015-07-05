/**
 * Content
 * =======
 *
 * Injects the 'sonarvior.js' script synchronous to start to prepare the prototypes.
 */

var script = document.createElement('script')
script.src = chrome.extension.getURL('sonarvio.js')
script.onload = function(){
  this.parentNode.removeChild(this)
}
document.documentElement.appendChild(script) // (document.head || ..) is not ready
