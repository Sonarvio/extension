/**
 * Utilities
 * =========
 *
 * Common tasks
 */


/**
 * Combining multiple Uint8Arrays into one
 *
 * TODO:
 *
 * // faster way to merge buffers
 *
 *   extract the merging into a web worker command, as it could leverage on another thread !
 *
 * @param  {[type]} buffers [description]
 * @return {[type]}         [description]
 */
export function mergeBuffers (buffers) {
  return Buffer.concat(buffers.map(
    (buffer)=>new Buffer(new Uint8Array(buffer))
  ))
  // prev:
  //   var last = buffers.shift()
  //   while (buffers.length > 0) {
  //     let curr = buffers.shift()
  //     var temp = new Uint8Array(last.byteLength + curr.byteLength)
  //     temp.set(last, 0) // position
  //     temp.set(curr, last.byteLength)
  //     last = temp
  //   }
  //   return last
}
