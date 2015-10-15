/**
 * Themes
 * ======
 *
 * Envirornment specific design/layout modifications based on the available elements.
 */

import { getHighestIndex, getValue } from '../utilities/common'


/**
 * Define elements and styles for specific sites
 *
 * @param {HTMLElement} video -
 */
export function getThemeParts (video) {

	const { origin } = window.location
	const videoStyles = getComputedStyle(video)

	// wrapper of the app container
	var wrapper = video.parentNode

	// styles of the app container
	var containerStyles = {
    position: 'absolute',
    zIndex: getHighestIndex(wrapper) + 1,
		top: videoStyles.marginTop,
    right: videoStyles.marginRight,
    overflow: 'hidden'
  }

	// styles of the app
	var appStyles = {
		width: getValue(videoStyles.width),
    height: getValue(videoStyles.height)
  }

	switch (true) {
		case (/youtube/).test(origin):
			const youtubeControl = wrapper.parentNode.querySelector('.ytp-chrome-bottom')
			const youtubeControlStyles = getComputedStyle(youtubeControl)
			appStyles.height -= (getValue(youtubeControlStyles.height) + 1)
			break
	}

	return {
		wrapper,
		containerStyles,
		appStyles
	}
}
