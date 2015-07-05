/**
 * Main
 * ====
 *
 *
 */

import React from 'react'

// var WaveSurfer = require('wavesurfer.js')
// import * as WaveSurfer from 'wavesurfer.js'
// console.log(WaveSurfer);

/**
 *
 */
export default class Main extends React.Component {

	static defaultProps = {

	}

	constructor (props) {
		super(props)
		this.state = {

		}
	}

	componentDidMount(){
		// let wavesurfer = Object.create(WaveSurfer)
		// wavesurfer.init({
		// 	container: this.refs.wavesurfer,
		// 	waveColor: 'violet',
		// 	progressColor: 'purple'
		// })
		// wavesurfer.on('ready', function(){
		// 	wavesurfer.play()
		// })
		// console.log(wavesurfer);
	}

	render(){
		return (
			<div className="Main">
				<div ref="wavesurfer"/>
				Main: {this.props.currentTime}
			</div>
		)
	}
}
