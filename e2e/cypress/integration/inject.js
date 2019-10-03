import React from 'react'
import ReactDOM from 'react-dom'
import { Inject, useInstance, DependencyContainerContext } from '../support/sut';
import { fixReactDomScope } from '../support';

class MyDependencyContainerContext extends DependencyContainerContext {
	containerMounted() {
		// nuffin
	}
}

class InjectTestHarness extends React.Component {
	render() {
		return (
				<Inject diKey={this.props.diKey}>
					{this.props.children}
				</Inject>
		);
	}
}

function UseInstanceTestHarness({ diKey, children }) {
	const instance = useInstance(diKey);
	return children(instance);
}

class MyClass {
	constructor() {
		this.foo = `Bar ${Date.now()}`;
	}
}

describe('Injecting a dependency', () => {

	// See https://github.com/bahmutov/cypress-react-unit-test/issues/51#issuecomment-494076389
	beforeEach(() => fixReactDomScope(window));

	describe('<Inject> component', () => {

		it('can get an instance', () => {
			let instance;

			cy.mount(
				<MyDependencyContainerContext>
					<InjectTestHarness diKey={MyClass}>
						{_instance => {
							instance = _instance;
							return null;
						}}
					</InjectTestHarness>
				</MyDependencyContainerContext>
			);

			cy.then(() => instance)
					.should('be.instanceOf', MyClass);
		});

	});

	describe('useInstance hook', () => {

		it('can get an instance', () => {
			let instance;

			cy.mount(
				<MyDependencyContainerContext>
					<UseInstanceTestHarness diKey={MyClass}>
						{_instance => {
							instance = _instance;
							return null;
						}}
					</UseInstanceTestHarness>
				</MyDependencyContainerContext>
			);

			cy.then(() => instance)
					.should('be.instanceOf', MyClass);
		});

	});

});
