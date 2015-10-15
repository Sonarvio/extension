/**
 * Common
 * ======
 *
 * Custom helper functions.
 */


/**
 * Combining multiple Uint8Arrays into one
 *
 * @param  {array} buffers -
 */
export function mergeBuffers (buffers) {
  return Buffer.concat(buffers.map(
    (buffer) => new Buffer(new Uint8Array(buffer))
  ))
}

/**
 * Traverse the DOM to retrieve the highest z-index of the container and its children.
 *
 * Based on: http://stackoverflow.com/a/5439622
 *
 * @param  {HTMLElement} parent -
 */
export function getHighestIndex (parent) {
  var maxIndex = 1
  for (const child of parent.children) {
    if (child.nodeType !== 1) {
      continue
    }
    const opacity = getStyle(child, 'opacity')
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
 * Retrieve styles from a DOMNode
 *
 * @param  {HTMLElement} node     -
 * @param  {string}      property -
 */
function getStyle (node, property) {
  return node.style[property] || getComputedStyle(node)[property]
}

/**
 * Retrieve values from a style description
 *
 * @return {string} style -
 */
export function getValue (style) {
  return parseFloat(style.replace(/\D+/g, ''))
}
