/**
 * Main
 * ====
 *
 *
 */

import { parse as parseUrl } from 'url'

import React, { Component, PropTypes } from 'react'

import Editor from 'sonarvio-editor'

// file loader references for static files and custom builds ()
require('file?name=[name].[ext]!sonarvio-converter/dist/proxy/proxy.html')
require('file?name=[name].[ext]!sonarvio-converter/dist/proxy/proxy.js')
require('file?name=[name].[ext]!sonarvio-converter/dist/proxy/ffmpeg-worker-webm_wav.js')
require('file?name=[name].[ext]!sonarvio-converter/dist/proxy/ffmpeg-worker-mp4.js')


/**
 *
 */
export default class Main extends Component {

	static defaultProps = {
		proxy: document.currentScript && parseUrl(document.currentScript.src, true).query.proxy
	}

	render(){
		const { proxy, data, video } = this.props
		return (
			<Editor proxy={proxy} source={data.buffer} video={video}/>
		)
	}
}
