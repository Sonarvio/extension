/**
 * Network
 * =======
 *
 * TODO:
 * - define a chunking interface for streams - current implementation returns one large buffer
 */

import { mergeBuffers } from './common'


/**
 * Fetch the data the refered video
 *
 * @param  {string} source -
 */
export function loadVideo (source) {
	return fetch(source, {
		method: 'HEAD',
		mode: 'cors'
	}).then((res) => {
		var acceptRanges = res.headers.get('Accept-Ranges')
		// single request load
		if (acceptRanges !== 'bytes') {
			return fetch(source, {
				method: 'GET',
				mode: 'cors'
			}).then((res) => res.arrayBuffer()).then((body) => ({ // media
				mime: null,
				codec: null,
				buffer: Buffer(new Uint8Array(body))
			}))
		}
		// multi request load
		// TODO:
		// - access using a web worker to optimize max cocurrent requests
		//
		// partial content loading benchmark, e.g.
		// 1-  56777.704ms
		// 3 - 38276.882ms
		// 5 - 22112.935ms
		var maxConnections = 4 // 6
		var contentLength = parseFloat(res.headers.get('Content-Length'))
		var chunkSize = Math.floor(contentLength/maxConnections)
		var chunkRest = contentLength - chunkSize * maxConnections
		var chunks = [] // new Array(max)
		for (var i = 0; i < maxConnections; i++) {
			var start = i * chunkSize
			var end = (i+1) * chunkSize - 1
			if (i === maxConnections - 1) {
				end += chunkRest + 1
			}
			// - force mimetype in the background:
			// http://stackoverflow.com/questions/15561508/xmlhttprequest-206-partial-content
			chunks[i] = fetch(source, {
										method: 'GET',
										mode: 'cors',
										headers: {
											Range: `${acceptRanges}=${start}-${end}`
										}
									}).then((res) => res.arrayBuffer())
		}
		return Promise.all(chunks).then((segments) => ({ // media
			mime: null,
			codec: null,
			buffer: mergeBuffers(segments)
		}))
	})
}
