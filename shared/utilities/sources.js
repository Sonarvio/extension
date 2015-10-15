/**
 * Sources
 * =======
 *
 * Modifies the 'MediaSource' protoype to record the (initial) loaded data from streams.
 * As the 'SourceBuffer' prototype is not accessible its factory gets monkeypatched.
 *
 *
 * Netflix:
 * -> audio/mp4; codecs="mp4a.40.5" | codecs="mp4a.40.5"
 * -> video/mp4; codecs="avc1.640028" | codecs="avc1.640028"
 *
 * Youtube:
 * -> audio/webm; codecs="opus" | codecs="opus"
 * -> video/webm; codecs="vp9" | codecs="vp9"
 *
 * or
 *
 * -> audio/mp4; codecs="mp4a.40.2" | codecs="mp4a.40.2"
 * -> video/webm; codecs="vp9" | codecs="vp9"
 */

import { mergeBuffers } from './common'

// check for possible modifications
if (!Object.isExtensible(URL)) {
  URL = Object.create(URL)
}

if (!Object.isExtensible(MediaSource.prototype)) {
  MediaSource.prototype = Object.create(MediaSource.prototype)
}

const references = Object.create(null)
const sources = Object.create(null)

// sourcebuffer meta infos
const BUFFERS = new WeakMap()


/**
 * [createObjectURL description]
 * -> https://docs.webplatform.org/wiki/apis/file/URL/createObjectURL
 *
 * @param  {object} object  -
 * @param  {object} options -
 */
const createObjectURL = URL.createObjectURL
URL.createObjectURL = function (object, options) {
  const url = createObjectURL.call(this, object, options)
  if (object instanceof MediaSource) {
    sources[url] = new Promise((resolve, reject) => {
      references[url] = [object, resolve]
    })
  }
  return url
}

/**
 * [addSourceBuffer description]
 * -> https://docs.webplatform.org/wiki/apis/media_source_extensions/MediaSource/addSourceBuffer
 * -> https://docs.webplatform.org/wiki/apis/media_source_extensions/MediaSource/appendBuffer
 *
 * @param {string} type - MIME type and (optional) codec of the new created SourceBuffer
 */
const addSourceBuffer = MediaSource.prototype.addSourceBuffer
MediaSource.prototype.addSourceBuffer = function (type) {
  // console.log('[START - SOURCE]', type, this)
  const SourceBuffer = addSourceBuffer.call(this, type)
  const [ mime, codecs ] = type.split(';')

  // meta information
  BUFFERS.set(SourceBuffer, {
    'mime': mime,
    'codec': codecs.match(/codecs="(\S+)"/)[1],
    'segments': []
  })

  const appendBuffer = SourceBuffer.appendBuffer
  SourceBuffer.appendBuffer = function (data) {
    BUFFERS.get(this).segments.push(data)
    return appendBuffer.call(this, data)
  }
  return SourceBuffer
}

/**
 * [endOfStream description]
 * -> https://docs.webplatform.org/wiki/apis/media_source_extensions/MediaSource/endOfStream
 *
 * @param {string} error -
 */
const endOfStream = MediaSource.prototype.endOfStream
MediaSource.prototype.endOfStream = function (error) {
  const sourceBuffers = this.activeSourceBuffers

  var media = null
  for (var i = 0, l = sourceBuffers.length; i < l; i++) {
    const sourceBuffer = BUFFERS.get(sourceBuffers[i])
    // filter to use only audio buffers (!= video, text)
    if (sourceBuffer.mime.includes('audio')) {
      media = {
        mime: sourceBuffer.mime,
        codec: sourceBuffer.codec,
        buffer: mergeBuffers(sourceBuffer.segments)
      }
      break
    }
  }

  if (media) {
    Object.keys(references).some((key) => {
      const instance = references[key]
      if (instance[0] === this) {
        instance[1](media) // trigger existings
        sources[key] = Promise.resolve(media)
        delete references[key]
        return true
      }
      return false
    })
  }

  if (error) {
    console.error(error)
  }
  // console.log('[END]', this, media)

  return endOfStream.apply(this, arguments)
}

export default sources
