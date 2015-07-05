/**
 * App
 * ===
 *
 *
 */

import React from 'react'
import classnames from 'classnames'
import NativeListener from 'react-native-listener'


import Logo from './views/Logo/Logo.jsx'
import Spinner from './views/Spinner/Spinner.jsx'

import Main from './controllers/Main/Main.jsx'
import Actions from './controllers/Actions/Actions.jsx'

import './App.styl'


/**
 * [createClass description]
 *
 * NOTE:
 * - currently remain the former '.createClass' syntax for proper reference unbinding of eventlistener
 */
export default React.createClass({

	propTypes: {
		getData: React.PropTypes.object.isRequired,
		maxStyle: React.PropTypes.object.isRequired,
		video: React.PropTypes.object.isRequired
	},

	getInitialState(){
		return {
			visible: false,
			open: false,
			data: null,
			currentTime: this.props.video.currentTime
		}
	},

	getDefaultProps(){
		return {
			cornerSize: 50, // 40px + 2 * 5px  padding
			visibleDistance: 200
		}
	},

	componentWillUnmount(){
		document.body.removeEventListener('mousemove', this.toggleApp)
		this.props.video.removeEventListener('timeupdate', this.updateTime)
	},

	componentDidMount(){
		document.body.addEventListener('mousemove', this.toggleApp)
		this.props.video.addEventListener('timeupdate', this.updateTime)

		this.props.getData.then(function (data) {
			if (this.isMounted()) { // https://facebook.github.io/react/docs/component-api.html#ismounted
				this.setState({ data })
			}
		}.bind(this))
	},

	// visible distance
	toggleApp (e) {

		if (this.state.open) {
			return // ignore as open
		}

		// wrapper node || ~ React.findDOMNode(this).parentNode
		var element = this.refs.trigger.getDOMNode()
		var bounding = element.getBoundingClientRect()

		// absolute DOM position
		var totalOffsetX = this.props.maxStyle.width - 2 * this.props.cornerSize
		var totalOffsetY = -this.props.maxStyle.height + 2 * this.props.cornerSize

		do {
			totalOffsetX += element.offsetLeft
			totalOffsetY += element.offsetTop
		} while (element = element.offsetParent)

		var posX = totalOffsetX + bounding.width/2
		var posY = totalOffsetY + bounding.height/2

		let dist = Math.floor(
			Math.sqrt(
				Math.pow(e.pageX - posX, 2) +
	  		Math.pow(e.pageY - posY, 2)
			)
		)

		if (dist <= this.props.visibleDistance) {
			if (!this.state.visible) {
				this.setState({ visible: true })
			}
		} else {
			if (this.state.visible) {
				this.setState({ visible: false })
			}
		}
	},

	updateTime (e) {
		this.setState({ currentTime: e.currentTarget.currentTime })
	},

	render(){
		let offsetX = this.state.open ? 0 : this.props.maxStyle.width - 2 * this.props.cornerSize;
		let offsetY = this.state.open ? 0 : 2 * this.props.cornerSize - this.props.maxStyle.height;
		return (
			<div className="App">
				<NativeListener onClick={this.handleClick}>
					<div className="App__Pane" style={{
							width: this.props.maxStyle.width,
							height: this.props.maxStyle.height,
							transform: `translate(${offsetX}px, ${offsetY}px)`,
							opacity: this.state.visible ? 0.8 : 0
						}}>
						<div className="App__Main">
							<Main data={this.state.data} currentTime={this.state.currentTime}/>
						</div>
						<div className="App__Controls">
							<div className="App__Trigger" ref="trigger">
								{this.state.data ? <Logo/> : <Spinner/>}
							</div>
							<div className="App__Actions">
								<Actions/>
							</div>
						</div>
					</div>
				</NativeListener>
			</div>
		)
	},

	handleClick (e) {
		e.preventDefault()
		e.stopPropagation()
		var trg = e.target;
		var classNames = trg.getAttribute('class') // className property not matched in SVG Paths
		switch (true) {
			case (/App__Controls/).test(classNames):
			case (/App__Trigger/).test(classNames):
			case (/Logo/).test(classNames):
			case (/Logo__Path/).test(classNames):
				if (this.state.data) {
					this.setState({ open: !this.state.open })
					if (this.props.video.paused) {
						this.props.video.play()
					} else {
						this.props.video.pause()
					}
				}
				break
			case (/App__Main/).test(classNames):
				console.log('main');
				break
		}
	}
})