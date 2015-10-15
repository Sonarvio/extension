/**
 * App
 * ===
 *
 *
 */

import React from 'react'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import prettyBytes from 'pretty-bytes'

import NativeListener from 'react-native-listener'

import Main from './templates/Main/Main.jsx'
import Logo from './templates/Logo/Logo.jsx'
import Spinner from './templates/Spinner/Spinner.jsx'

import __ from './App.styl'


/**
 * NOTE:
 * The classical '.createClass' syntax is used to have proper unbinding of
 * EventListeners. Moreover it includes a check if a component is still mounted
 * (https://facebook.github.io/react/docs/component-api.html#ismounted).
 */
export default React.createClass({

	propTypes: {
		getData: React.PropTypes.object.isRequired,
		appStyles: React.PropTypes.object.isRequired,
		video: React.PropTypes.object.isRequired
	},

	getDefaultProps(){
		return {
			cornerSize: 50, // Trigger.width [40] + 2 * Trigger.padding [5]
			visibleDistance: 200
		}
	},

	getInitialState(){
		return {
			visible: false,
			open: false,
			data: null
		}
	},

	componentDidMount(){
		document.body.addEventListener('mousemove', this.checkToggleApp)

		// apply data if the app instance is mounted && max. 100MB
		this.props.getData.then((data) => {
			if (this.isMounted()) {
				if (data.buffer.length <= 100000000) {
					return this.setState({ data })
				}
				console.info(`
					The video "${this.props.video.src}" has a size of ${prettyBytes(data.buffer.length)}.
					Unfortunatly currently the extension only allows to parse data smaller than 100MB!
				`)
			}
		})
	},

	componentWillUnmount(){
		document.body.removeEventListener('mousemove', this.checkToggleApp)
	},

	render(){
		const { appStyles, cornerSize, video } = this.props
		const { open, visible, data } = this.state

		const offsetX = open ? 0 : appStyles.width - 2 * cornerSize
		const offsetY = open ? 0 : 2 * cornerSize - appStyles.height

		return (
			<div className={__.App} style={{
					width: appStyles.width,
					height: appStyles.height,
					transform: `translate(${offsetX}px, ${offsetY}px)`,
					opacity: visible ? 0.9 : 0
				}}>
				<NativeListener onClick={this.handleClick}>
					<div className={__.Pane} data-class="Pane">
						<div className={__.Main}>
							{data && (<Main data={data} video={video}/>)}
						</div>
						<div className={__.Trigger} ref="trigger" data-class="Trigger">
							{data ? <Logo/> : <Spinner/>}
						</div>
					</div>
				</NativeListener>
			</div>
		)
	},

	// check visible distance
	checkToggleApp (e) {
		const { appStyles, cornerSize, visibleDistance } = this.props
		const { open, visible } = this.state

		if (open) {
			return
		}

		var trigger = ReactDOM.findDOMNode(this.refs.trigger)
		var bounding = trigger.getBoundingClientRect()

		// absolute DOM position
		var totalOffsetX = appStyles.width - 2 * cornerSize
		var totalOffsetY = -appStyles.height + 2 * cornerSize

		do {
			totalOffsetX += trigger.offsetLeft
			totalOffsetY += trigger.offsetTop
		} while (trigger = trigger.offsetParent)

		const posX = totalOffsetX + bounding.width/2
		const posY = totalOffsetY + bounding.height/2

		const dist = Math.floor(
			Math.sqrt(
				Math.pow(e.pageX - posX, 2) +
	  		Math.pow(e.pageY - posY, 2)
			)
		)

		if (dist <= visibleDistance) {
			if (!visible) {
				this.setState({ visible: true })
			}
		} else {
			if (visible) {
				this.setState({ visible: false })
			}
		}
	},

	/**
	 * Manually setup an event delegation as react is currently not
	 * bound by instance scope of its root element but the 'document.body'.
	 *
	 * TODO:
	 * - replace with a proper signaling mechanism without interfering
	 * 	 with existing systems
	 *
	 * @param  {object} e - MouseEvent
	 */
	handleClick (e) {
		const { video } = this.props
		const { data, open } = this.state
		const { target } = e

		const className = target.dataset.class || target.className
		switch (true) {
			case (/ResourcesPanel__Button/).test(className):
			case (/LookupPanel__Link/).test(className):
			case (/Dualpane__Label/).test(className):
				const { paused, volume } = video
				video.volume = 0
				if (paused) {
					video.addEventListener('play', function surpressPlay (e) {
						video.removeEventListener('play', surpressPlay)
						video.pause()
						video.volume = volume
					})
				} else {
					video.addEventListener('pause', function surpressPause (e) {
						video.removeEventListener('pause', surpressPause)
						video.play()
						video.volume = volume
					})
				}
				break
			case (/Trigger/).test(className):
			case (/Spinner/).test(className):
			case (/Logo/).test(className):
			case (/Pane/).test(className):
				if (data) {
					this.setState({ open: !open }, () => {
						video[this.state.open ? 'pause' : 'play']()
					})
				} else {
					console.info('Initial data needs to be loaded first - keep waiting!')
				}
			default:
				e.preventDefault()
				e.stopPropagation()
		}
	}
})
