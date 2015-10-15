/**
 * Main
 * ====
 *
 *
 */

import '../utilities/adapter'

import React from 'react'
import ReactDOM from 'react-dom'
import App from '../components/App.jsx'

import sources from '../utilities/sources'
import { loadVideo } from '../utilities/network'

import { getThemeParts } from './themes'


if (document.state === 'loading') {
  document.addEventListener('DOMContentLoaded', ready)
} else { // 'interactive' || 'complete' || undefined ~> localhost
  ready()
}

/**
 * Ensure initial load
 */
function ready(){
  
  // console.log(':: Sonarvio ::')

  // static: wrap around existing elements
  for (let video of document.querySelectorAll('video')) {
    addContainerApp(video)
  }

  // dynamic: define an observer for checking additions or changes
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      var trg = mutation.target
      if (mutation.attributeName) {
        if (trg.nodeName === 'VIDEO') { // changed
          // TODO:
          // - handling multiple videos using the same parent container
          //  (currently removes all|first)
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
  }).observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src']
  })
}

/**
 * Select a method to get the data and an application instance with markup.
 *
 * @param {HTMLElement} video -
 */
function addContainerApp (video) {
  // check identifier match
  const getData = Object.keys(sources).indexOf(video.src) > -1 ?
                  sources[video.src] : loadVideo(video.src)

  const { wrapper, containerStyles, appStyles } = getThemeParts(video)

  const container = document.createElement('div')
  Object.assign(container.style, containerStyles)
  container.className = 'Sonarvio'

  ReactDOM.render(React.createElement(App, {
    getData,   // promise for accesing the data
    appStyles, // overlay boundaries
    video      // element reference
  }), container)

  getData.catch((err) => {
    console.error(err)
    removeContainerApp(wrapper)
  })

  wrapper.appendChild(container)
}

/**
 * Unmount component and remove container
 *
 * @param {HTMLElement} video -
 */
function removeContainerApp (video) {
  var prev = video.parentNode.querySelector('.Sonarvio')
  if (prev) { // check and remove existing wrapper + app
    ReactDOM.unmountComponentAtNode(prev)
    prev.parentNode.removeChild(prev)
  }
}
