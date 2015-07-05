/**
 * Background
 * ==========
 *
 * Intercept and allow CORS request for all 'arraybuffer' requests on video sources.
 *
 * API:
 * 	- https://developer.chrome.com/extensions/webRequest
 */

var accessControlRequestHeadersg

/**
 * [addListener description]
 *
 * @param {[type]}
 */
chrome.webRequest.onBeforeSendHeaders.addListener(function requestListener (details) {
  if (isSupportedType(details.url)) {
    if (details.method === 'OPTIONS') {
      for (var header of details.requestHeaders) {
        if (header.name === 'Access-Control-Request-Headers') {
          accessControlRequestHeaders = header.value
          console.log(header, 000);
          break
        }
      }
    }
  }
  return {
    requestHeaders: details.requestHeaders
  }
}, {
  urls: ["*://*/*"]
}, [
  'blocking', 'requestHeaders'
])

/**
 * [addListener description]
 *
 * @param {[type]}
 */
chrome.webRequest.onHeadersReceived.addListener(function responseListener (details) {
  var headers = details.responseHeaders

  if (isSupportedType(details.url) && ['OPTIONS', 'HEAD', 'GET'].indexOf(details.method) > -1) {

    var set = false

    // check if header is provided -> but not for its own origin
    for (var header of headers) {
      if (header.name === 'Access-Control-Allow-Origin') {
        set = true
        header.value = '*'
        break
      }
    }

    // if none provided - allow by addingthe header
    if (!set)  {
      headers.push({
        name: 'Access-Control-Allow-Origin',
        value: '*'
      })
    }

    // used - set during the request phase
    if (accessControlRequestHeaders) {
      headers.push({
        name: 'Access-Control-Allow-Headers',
        value: accessControlRequestHeaders
      })
    }

    // optional -> check if access-control-allow is not set, then set

    // define the methods of HEAD, GET, OPTIONS
    // details.responseHeaders.push({
    //   name: 'Access-Control-Allow-Methods',
    //   value: 'HEAD, GET, OPTIONS'
    // })

    // declare accessible properties
    headers.push({
      name: 'Access-Control-Expose-Headers',
      value: 'Accept-Ranges, Content-Encoding, Content-Range, Content-Length'
    })
  }

  return {
    responseHeaders: headers
  }
}, {
  urls: ["*://*/*"]
}, ['blocking', 'responseHeaders'])


/**
 * [isSupportedType description]
 *
 * @param  {[type]}  url [description]
 * @return {Boolean}     [description]
 */
function isSupportedType (url) {
  var extension = url.substr(url.lastIndexOf('.') + 1).toLowerCase() // file type
  return ['mp4','ogg'].indexOf(extension) > -1
}
