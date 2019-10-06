import React from 'react';

export class ToggleChildrenComponent extends React.Component {
	state = {
		showChildren: true
	}

	unmountChildren = () => this.setState({ showChildren: false });

	render() {
		if (!this.state.showChildren) {
			return null;
		}

		return this.props.children;
	}
}

