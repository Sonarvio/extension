/**
 * Sources
 * =======
 *
 * Register/Patch
 *
 * Modifies the 'MediaSource' protoype to record the (initial) loaded data from streams.
 * As the 'SourceBuffer' prototype is not accessible its factory gets monkeypatched.
 */

import Promise from 'bluebird'

import {mergeBuffers} from './utilities'


// check for possible modifications
if (!Object.isExtensible(URL)) {
  URL = Object.create(URL)
}

if (!Object.isExtensible(MediaSource.prototype)) {
  MediaSource.prototype = Object.create(MediaSource.prototype)
}

var references = Object.create(null) // refer to unresolved Promises
var sources = Object.create(null)


/**
 * [createObjectURL description]
 *
 * -> https://docs.webplatform.org/wiki/apis/file/URL/createObjectURL
 *
 * @param  {[type]} object  [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
var createObjectURL = URL.createObjectURL
URL.createObjectURL = function (object, options) {
  var url = createObjectURL.call(this, object, options)
  if (object instanceof MediaSource) {
    sources[url] = new Promise(function (resolve, reject) {
      references[url] = [object, resolve]
    })
  }
  return url
}

/**
 * [addSourceBuffer description]
 *
 * -> https://docs.webplatform.org/wiki/apis/media_source_extensions/MediaSource/addSourceBuffer
 *
 * @param {String} desc - MIME type and (optional) codec of the new created SourceBuffer
 */
var addSourceBuffer = MediaSource.prototype.addSourceBuffer
MediaSource.prototype.addSourceBuffer = function (type) {
  var SourceBuffer = addSourceBuffer.call(this, type)

  // console.log('[START - SOURCE]', type, this)

  // info + reference list
  type = type.split(';')
  SourceBuffer.__ = {
    'mime': type[0],
    'codec': type[1],
    'segments': []
  }

  var appendBuffer = SourceBuffer.appendBuffer
  SourceBuffer.appendBuffer = function (data) {

    // progress handler defined as here regoznied loading  .... news about the maxmium ?
    // console.log('appendBuffer', data)

    // execute next tick for smoother adaption of the original stream signals
    // setImmediate(this.__.segments.push, data)
    this.__.segments.push(data)
    return appendBuffer.call(this, data)
  }

  return SourceBuffer
}

/**
 * [endOfStream description]
 *
 * @return {[type]} [description]
 */
var endOfStream = MediaSource.prototype.endOfStream
MediaSource.prototype.endOfStream = function(){
  var sourceBuffers = this.activeSourceBuffers
  var buffers = []

  // filter to use only audio buffers (!= video, text etc.)
  for (var i = 0, l = sourceBuffers.length; i < l; i++) {
    var buffer = sourceBuffers[i].__
    if (buffer.mime.includes('audio')) {
      buffers.push(buffer)
    }
  }

  // console.log('[END]', this, buffers)

  /** sync **/
  var data = extractData(buffers)
  // handleData( extractData(buffers) )

  /** async **/
  // concurrent(extractData, [mergeBuffers])(handleData)(buffers)
  var blob = data[0] // multiple audio tracks ?

  Object.keys(references).some(function (key) {
    var instance = references[key]
    if (instance[0] === this) {
      instance[1](blob) // trigger existings
      sources[key] = Promise.resolve(blob)
      delete references[key]
      return true
    }
    return false
  }, this)

  return endOfStream.apply(this, arguments)
}

/**
 * [extractData description]
 *
 * Using sync file reader in WebWorker context
 *
 * @param  {[type]} buffers [description]
 * @return {[type]}         [description]
 */
function extractData (buffers) {
  var data = []
  while (buffers.length > 0) {
    var buffer = buffers.shift()
    data.push(new Blob([ mergeBuffers(buffer.segments) ], { type: buffer.mime }))
  }
  return data
}

export default sources
