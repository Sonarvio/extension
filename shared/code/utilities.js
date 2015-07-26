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

/**
 * [getHighestIndex description]
 * Traverse the DOM to retrieve the highest z-index of the container and its children.
 *
 * Based on: http://stackoverflow.com/a/5439622
 *
 * @param  {[type]} parent [description]
 * @return {[type]}        [description]
 */
export function getHighestIndex (parent) {
  var maxIndex = 1
  for (const child of parent.children) {
    if (child.nodeType !== 1) {
      continue
    }
    var opacity = getStyle(child, 'opacity')
    var index = null
    if (getStyle(child, 'position') !== 'static') {
      index = getStyle(child, 'zIndex')
      index = (index === 'auto') ? (opacity < 1) ? 0 : getHighestIndex(child)
                                                 : parseInt(index, 10) || 0
    } else {
      index = (opacity < 1) ? 0 : getHighestIndex(child)
    }
    if (index > maxIndex)  {
      maxIndex = index
    }
  }
  return maxIndex
}

/**
 * [getStyle description]
 *
 * Retrieve styles from a DOMNode
 *
 * @param  {[type]} node     [description]
 * @param  {[type]} property [description]
 * @return {[type]}          [description]
 */
function getStyle (node, property) {
  return node.style[property] || getComputedStyle(node)[property]
}
