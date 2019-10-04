import React from 'react'
import { fixReactDOMScope, DeferredValue } from '../support';
import { StringState, State, Subscribe } from '../support/sut';

class StateRenderPropsSpy {
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

class ExternallyResolvablePromise {

	constructor() {

		let resolve;
		const promise = new Promise(_resolve => {
			resolve = _resolve;
		});

		this.then = (cb) => promise.then(cb);
		this.catch = (cb) => promise.catch(cb);
		this.resolve = value => resolve(value);

	}

}

class ToggleChildrenComponent extends React.Component {
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

describe('Subscribing to state', () => {

	// See https://github.com/bahmutov/cypress-react-unit-test/issues/51#issuecomment-494076389
	beforeEach(() => fixReactDOMScope(window));

	describe('<Subscribe> component', () => {

		it('can get the initial value', () => {

			const state = new State({ value: 'The initial value' });
			const renderPropsSpy = new StateRenderPropsSpy();

			const SUT = () => (
				<Subscribe to={() => state}>
					{renderPropsSpy.render}
				</Subscribe>
			);

			cy.mount(<SUT />);

			cy.wrap(renderPropsSpy)
				.its('states')
				.should('have.length', 1);

			cy.wrap(renderPropsSpy)
				.its('states.0')
				.should('deep.equal', { value: 'The initial value' });
		});

		it('can render the children', () => {
			const state = new State({ doesnt: 'matter' });
			const renderPropsSpy = new StateRenderPropsSpy('Hi there!');

			const SUT = () => (
				<Subscribe to={() => state}>
					{renderPropsSpy.render}
				</Subscribe>
			);

			cy.mount(<SUT />);

			cy.contains(renderPropsSpy.content);
		});

		it(`doesn't render when there is no initial value`, () => {
			const state = new State();
			const renderPropsSpy = new StateRenderPropsSpy();

			const SUT = () => (
				<Subscribe to={() => state}>
					{renderPropsSpy.render}
				</Subscribe>
			);

			cy.mount(<SUT />);

			cy.wrap(renderPropsSpy)
				.its('states')
				.should('have.length', 0);
		});

		it(`when props.to is async, doesn't render until it resolves`, () => {
			const state = new State({ value: 'The async value' });
			const renderPropsSpy = new StateRenderPropsSpy();
			const statePromise = new ExternallyResolvablePromise();

			const SUT = () => (
				<Subscribe to={() => statePromise}>
					{renderPropsSpy.render}
				</Subscribe>
			);

			cy.mount(<SUT />);

			cy.wrap(renderPropsSpy).its('states').should('have.length', 0);

		  cy.then(() => {
				statePromise.resolve(state);
			});

			cy.wrap(renderPropsSpy)
				.invoke('getMostRecentState')
				.its('value')
				.should('equal', 'The async value');
		});

		it(`renders when state changes`, () => {
			const state = new StringState();
			const renderPropsSpy = new StateRenderPropsSpy();

			const SUT = () => (
				<Subscribe to={() => state}>
					{renderPropsSpy.render}
				</Subscribe>
			);

			cy.mount(<SUT />);

			cy.wrap(renderPropsSpy)
				.invoke('getMostRecentState')
				.its('value')
				.should('equal', '');

			cy.then(() => state.set('First value'));

			cy.wrap(renderPropsSpy)
				.invoke('getMostRecentState')
				.its('value')
				.should('equal', 'First value');
		});

		it(`unsubscribes on unmount`, () => {
			const state = new State();

			const SUT = () => (
					<Subscribe to={() => state}>
						{() => null}
					</Subscribe>
			);

			const App = (
				<ToggleChildrenComponent>
					<SUT />
				</ToggleChildrenComponent>
			);

			cy.mount(App);

			cy.wrap(state)
				.its('subscriptions')
				.should('have.length', 1);

			cy.get(App)
				.invoke('unmountChildren');

			cy.wrap(state)
				.its('subscriptions')
				.should('have.length', 0);
		});

		it(`re-subscribes on unmount/remount`, () => {
			let stateCount = 0;
			const getState = () => {
				stateCount++;
				return new State({ value: stateCount === 1 ? 'First State' : 'Re-subscribed State' });
			};
			const renderPropsSpy = new StateRenderPropsSpy();

			class SUT extends React.Component {
				state = { value: 'anything' }

				render() {
					return (
						<Subscribe to={getState} key={this.state.value}>
							{renderPropsSpy.render}
						</Subscribe>
					);
				}
			}

			cy.mount(<SUT />)

			// Should have the initial state
			cy.wrap(renderPropsSpy)
				.invoke('getMostRecentState')
				.its('value')
				.should('equal', 'First State');

			// Change the state used as Subscribe.key
			cy.get(SUT)
				.invoke('setState', { value: 'anything else' });

		  // For some reason this line makes it pass in electron
			cy.wrap(renderPropsSpy)
				.its('renderCount')
				.should('equal', 2);

			// Should have resubscribed with a new state
			cy.wrap(renderPropsSpy)
				.invoke('getMostRecentState')
				.its('value')
				.should('equal', 'Re-subscribed State');
		});

		// Couldn't get this test passing headlessly
		// Hopefully cypress gets newer version of electron soon?
		// https://github.com/cypress-io/cypress/pull/4720
		it.skip(`when props.dispose is set, state.dispose is called on unmount`, () => {
			const state = new State();
			const disposeCalled = new DeferredValue();
			state.dispose = () => disposeCalled.set(true);

			const SUT = () => (
					<Subscribe to={() => state} dispose={true}>
						{() => null}
					</Subscribe>
			);

			const App = (
				<ToggleChildrenComponent>
					<SUT />
				</ToggleChildrenComponent>
			);

			cy.mount(App);

			cy.get(App)
				.invoke('unmountChildren');

			cy.wrap(disposeCalled)
				.invoke('valueOf')
				.should('be.true');
		});

	});

	describe('useSubscription hook', () => {


	});

});
