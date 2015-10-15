/**
 * Spinner
 * =======
 *
 * Infinite progress/loading animation
 *
 * Source:
 * 	- http://tobiasahlin.com/spinkit/		|| page 6
 */

import React, { Component } from 'react'

import __ from './Spinner.styl'


/**
 *
 */
export default class Spinner extends Component {
	render(){
		return (
			<div className={__.Spinner} data-class="Spinner">
				<div className={__.Dot} data-class="Spinner"/>
				<div className={__.Dot} data-class="Spinner"/>
			</div>
		)
	}
}
