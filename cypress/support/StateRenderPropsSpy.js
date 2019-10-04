export class StateRenderPropsSpy {
	constructor(content = null) {

		this.content = content;
		this.states = [];

		this.renderCount = 0;

		this.render = state => {
			this.states.push(state);
			this.renderCount++;

			return this.content;
		};

		this.getMostRecentState = () => {
			if (!this.states.length) {
				// Cypress won't retry on undefined or undefined, so throw
				throw new Error('No states!')
			}

			return this.states[this.states.length - 1];
		}
	}
}
