/**
 * Logo
 * ====
 *
 * Optimized inline SVG.
 */

import React, { Component } from 'react'


/**
 *
 */
export default class Logo extends Component {

	static defaultProps = {
		backgroundColor: '#dcdbdb',
		color: '#333'
	}

	render(){
		const { backgroundColor, color } = this.props
		return (
			<svg className="Logo" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140.078 140.127"
				data-class="Logo">
				<path d="M182.838 400.814h206.07V300.81H180.82z" stroke={color} transform="matrix(.64076 0 0 .87375 -115.536 -210.52)" fill={color}
					data-class="Logo"/>
				{/** node **/}
				<path d="M52.69 69.79v44.581c-3.263-1.3-7.79-1.3-12.17.762-6.505 3.066-8.34 8.65-5.837 12.193 2.504 3.543 9.35 5.032 15.86 1.97 4.684-2.21 6.945-5.727 6.912-8.838V86.39l38.16-6.99v30.603c-3.268-1.302-7.79-1.302-12.168.76-6.507 3.067-8.343 8.65-5.84 12.193 2.5 3.543 9.345 5.033 15.857 1.97 4.674-2.206 6.94-5.718 6.91-8.83V61.053L52.69 69.79z"
				fill={backgroundColor} data-class="Logo"/>
			<path d="M241.07 338.434L103.016 301.44l5.72-21.343 138.31 37.06-5.867 21.898" fill={color} stroke={color} transform="matrix(.952 0 0 .872 -95.79 -243.8)" data-class="Logo"/>
				{/** lines in the clap **/}
				<path d="M468.71 22.512l11.016 2.95 8.26 14.31-12.372-3.316z" fill={backgroundColor} stroke={color} transform="matrix(1.54 0 0 1.41 -713.657 -29.16)" data-class="Logo"/>
				<path d="M468.71 22.512l11.016 2.95 8.26 14.31-12.372-3.316z" fill={backgroundColor} stroke={color} transform="matrix(1.54 0 0 1.41 -684.41 -22.655)" data-class="Logo"/>
				<path d="M468.71 22.512l11.016 2.95 8.26 14.31-12.372-3.316z" fill={backgroundColor} stroke={color} transform="matrix(1.54 0 0 1.41 -656.583 -16.047)" data-class="Logo"/>
				<path d="M468.71 22.512l11.016 2.95 8.26 14.31-12.372-3.316z" fill={backgroundColor} stroke={color} transform="matrix(1.54 0 0 1.41 -624.98 -8.496)" data-class="Logo"/>
				<path d="M468.71 22.512l8.494 2.4-1.038 5.244-1.025 4.96z" fill={backgroundColor} stroke={color} transform="matrix(1.54 0 0 1.41 -597.87 -1.338)" data-class="Logo"/>
			</svg>
		)
	}
}
