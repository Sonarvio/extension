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

import __ from './Spinner.styl'


/**
 *
 */
export default class Spinner extends React.Component {
	render(){
		return (
			<div className={__.Spinner}>
				<div className={__.Dot}></div>
				<div className={__.Dot}></div>
			</div>
		)
	}
}
