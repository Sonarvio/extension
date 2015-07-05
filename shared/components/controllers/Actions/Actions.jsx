/**
 * Actions
 * =======
 *
 *
 */

import React from 'react'

import './Actions.styl'


/**
 *
 */
export default class Actions extends React.Component {

	static defaultProps = {

	}

	constructor (props) {
		super(props)
		this.state = {

		}
	}

	render(){
		return (
			<div className="Actions">
				<button className="Actions__Button">
					{true ? 'Identify' : 'Edit'}
				</button>
			</div>
		)
	}
}
