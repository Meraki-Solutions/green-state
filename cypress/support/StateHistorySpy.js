export class StateHistorySpy {
	constructor() {

		this.states = [];

		this.push = state => this.states.push(state);

		this.getCount = () => this.states.length;

		this.getMostRecentState = () => {
			if (!this.states.length) {
				// Cypress won't retry on undefined or undefined, so throw
				throw new Error('No states!')
			}

			return this.states[this.states.length - 1];
		}
	}
}

