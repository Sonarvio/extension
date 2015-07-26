/**
 * Main
 * ====
 *
 * ~ Sonarvio Code ~
 */

// initial link - will be added by the plugin
// Testvideo:
//
//  Nothing Left to Prove - https://www.youtube.com/watch?v=BwfOMuW5YQQ

import React from 'react'

import './adapter'
import sources from './sources'
import {mergeBuffers, getHighestIndex} from './utilities.js'

import App from '../components/App.jsx'


if (document.state === 'loading') {
  document.addEventListener('DOMContentLoaded', ready)
} else { // 'interactive' || 'complete' || undefined ~ localhost
  ready()
}

/**
 * [ready description]
 * Ensure readyness of
 *
 * @return {[type]} [description]
 */
function ready(){

  console.log(':: Sonarvio ::')
  // console.log(sources)

  // static: wrap around existing ones
  var identifiers = Object.keys(sources)
  for (let video of document.querySelectorAll('video')) {
    addContainerApp(video)
  }

  // dynamic: define an observer for checking additions or changes
  new MutationObserver(function (mutations) {
    mutations.forEach(function(mutation){
      var trg = mutation.target
      if (mutation.attributeName) {
        if (trg.nodeName === 'VIDEO') { // changed
          // TODO:
          // - handling multiple videos using the same parent container (currently removes all|first)
          removeContainerApp(trg)
          addContainerApp(trg)
        }
      } else {
        for (let trg of mutation.addedNodes) { // added
          if (trg.nodeName === 'VIDEO' && trg.src) {
            addContainerApp(trg)
          }
        }
        for (let trg of mutation.removedNodes) { // removed
          if (trg.nodeName === 'VIDEO') {
            removeContainerApp(trg)
          }
        }
      }
    })
  }).observe(document, { // document.body doesnt exist as append in the header
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src']
  })
}

/**
 * [removeContainer description]
 * @param  {[type]} video [description]
 * @return {[type]}       [description]
 */
function removeContainerApp (video) {
  var prev = video.parentNode.querySelector('.Sonarvio')
  if (prev) { // check and remove existing wrapper + app
    React.unmountComponentAtNode(prev)
    prev.parentNode.removeChild(prev)
  }
}

/**
 * [addContainerApp description]
 *
 * Pick a proper selected method to get the data
 * Adding the static markup for the application
 *
 * @param {[type]} video [description]
 */
function addContainerApp (video) {

  // TODO:
  // - define a chunking interface for streams - current implementation retruns just one large
  //   buffer for simplicity ....
  // - fetch doesn't provide progress information for a proper loading indicator
  let getData = Object.keys(sources).indexOf(video.src) > -1 ? // includes - matches identifier
                  sources[video.src] :
                  fetch(video.src, {
                    method: 'HEAD',
                    mode: 'cors'
                  }).then(function (res) {
                    var acceptRanges = res.headers.get('Accept-Ranges')
                    if (acceptRanges !== 'bytes') { // single request load
                      return fetch(video.src, {
                        method: 'GET',
                        mode: 'cors'
                      }).then((res)=>res.arrayBuffer()).then(function (body) {
                        return Buffer(new Uint8Array(body))
                      })
                    }
                    // partial content loading benchmark, e.g.
                    // 1-  56777.704ms
                    // 3 - 38276.882ms
                    // 5 - 22112.935ms
                    //
                    // TODO:
                    // - access using a web worker to optimize max cocurrent reuqests
                    var maxConnections = 6
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
                      chunks[i] = fetch(video.src, {
                                    method: 'GET',
                                    mode: 'cors',
                                    headers: {
                                      Range: `${acceptRanges}=${start}-${end}`
                                    }
                                  }).then((res)=>res.arrayBuffer())
                    }
                    return Promise.all(chunks).then(mergeBuffers)
                  })
  // TODO:
  // - check if the video element around is already styled - could break the structure
  //   e.g. computate the position regarding the parents offset (currently just margin)

  // theme distinction between different platforms || user settings at which corner the application
  // sould be stickied -> normally/default at the right top corner - but could also change on user
  // decision -> reading a variable ?

  let wrapper = video.parentNode // original video parent container
  wrapper.style.position = 'relative'

  let videoStyle = getComputedStyle(video)
  let container = document.createElement('div')
  container.className = 'Sonarvio'

  Object.assign(container.style, {
    position: 'absolute',
    zIndex: getHighestIndex(wrapper) + 1,
    maxWidth: videoStyle.width,
    maxHeight: videoStyle.height,
    top: videoStyle.marginTop,
    right: videoStyle.marginRight,
    overflow: 'hidden'
  })

  let maxStyle = {
    width: parseFloat(container.style.maxWidth.replace(/\D+/g, '')),
    height: parseFloat(container.style.maxHeight.replace(/\D+/g, ''))
  }

  React.render(React.createElement(App, {
    getData, // promise for accesing the data
    maxStyle, // element boundaries
    video
  }), container)

  wrapper.appendChild(container)
}
