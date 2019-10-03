import React from 'react'
import ReactDOM from 'react-dom'
import { Inject, useInstance, DependencyContainerContext, withDependencies } from '../support/sut';
import { fixReactDOMScope } from '../support';

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

function createWithDependenciesTestHarness(diKey, propName = 'myInstance') {
	function WithDependenciesTestHarnessTestHarness(props) {
		return props.children(props[propName]);
	}

	return withDependencies({
		[propName]: diKey
	})(WithDependenciesTestHarnessTestHarness);
}


class MyClass {
	constructor() {
		this.foo = `Bar ${Date.now()}`;
	}
}

describe('Injecting a dependency', () => {

	// See https://github.com/bahmutov/cypress-react-unit-test/issues/51#issuecomment-494076389
	beforeEach(() => fixReactDOMScope(window));

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

			cy.wrap().should(() => {
				expect(instance).to.be.instanceOf(MyClass)
			});
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

			cy.wrap().should(() => {
				expect(instance).to.be.instanceOf(MyClass)
			});
		});

	});

	describe('withDependencies HOC', () => {

		it('can get an instance', () => {
			// Need to create it at runtime b/c HOC and can't know diKey value until then
			const WithDependenciesTestHarnessTestHarness = createWithDependenciesTestHarness(MyClass);

			let instance;

			cy.mount(
				<MyDependencyContainerContext>
					<WithDependenciesTestHarnessTestHarness>
						{(_instance) => {
							instance = _instance;
							return null;
						}}
					</WithDependenciesTestHarnessTestHarness>
				</MyDependencyContainerContext>
			);

			cy.wrap().should(() => {
				expect(instance).to.be.instanceOf(MyClass)
			});
		});

	});

});
