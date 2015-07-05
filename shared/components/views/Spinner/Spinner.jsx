/**
 * Spinner
 * =======
 *
 * Infinite progress/loading animation
 *
 * Source:
 * 	- http://tobiasahlin.com/spinkit/		|| page 6
 */

import React from 'react'

import './Spinner.styl'


/**
 *
 */
export default class Spinner extends React.Component {
	render(){
		return (
			<div className="Spinner">
				<div className="Spinner__Dot Spinner__Dot-1"></div>
				<div className="Spinner__Dot Spinner__Dot-2"></div>
			</div>
		)
	}
}
