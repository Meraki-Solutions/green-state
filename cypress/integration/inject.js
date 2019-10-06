import React from 'react'
import { Inject, useInstance, withDependencies } from '../support/sut';
import { ContainerContext, ContainerContextWithValue, DeferredValue, RenderPropsSpy } from '../support';
import { fixReactDOMScope } from '../support';

// We only do identity checks, so doesn't need any properties
class MyClass { }

describe('Injecting a dependency', () => {

	// See https://github.com/bahmutov/cypress-react-unit-test/issues/51#issuecomment-494076389
	beforeEach(() => fixReactDOMScope(window));

	// May want to implement these for each inject provider
	it.skip('must have a root IOC provider');
	it.skip('hierarchical containers dispose instances');

	describe('<Inject> component', () => {

		const SUT = Inject;

		it('can get an instance', () => {
			const renderPropsSpy = new RenderPropsSpy('Hi there!');

			const App = (
				<ContainerContext>
					<SUT diKey={MyClass}>
						{renderPropsSpy.render}
					</SUT>
				</ContainerContext>
			);

			cy.mount(App);

			cy.wrap(renderPropsSpy)
				.its('firstProp')
				.should('be.instanceOf', MyClass);

			cy.contains(renderPropsSpy.content)
		});

		it('can get an instance from a child container', () => {
			const renderPropsSpy = new RenderPropsSpy();
			const childInstance = new MyClass();

			const App = (
				<ContainerContext>
					<ContainerContextWithValue diKey={MyClass} value={childInstance}>
						<SUT diKey={MyClass}>
							{renderPropsSpy.render}
						</SUT>
					</ContainerContextWithValue>
				</ContainerContext>
			);

			cy.mount(App);

			cy.wrap(renderPropsSpy)
				.its('firstProp')
				.should('be.equal', childInstance);
		});

		it('can get an instance from a child container overriding the parent', () => {
			const renderPropsSpy = new RenderPropsSpy();
			const parentInstance = new MyClass();
			const childInstance = new MyClass();

			const App = (
				<ContainerContextWithValue diKey={MyClass} value={parentInstance}>
					<ContainerContextWithValue diKey={MyClass} value={childInstance}>
						<SUT diKey={MyClass}>
							{renderPropsSpy.render}
						</SUT>
					</ContainerContextWithValue>
				</ContainerContextWithValue>
			)

			cy.mount(App);

			cy.wrap(renderPropsSpy)
				.its('firstProp')
				.should('be.equal', childInstance)
				.should('not.be.equal', parentInstance);
		});

		it.skip('can inject multiple values');

	});

	describe('useInstance hook', () => {

		it('can get an instance', () => {
			const instance = new DeferredValue();

			const SUT = () => {
				instance.set(useInstance(MyClass));
				return null;
			};

			const App = (
				<ContainerContext>
					<SUT />
				</ContainerContext>
			);

			cy.mount(App);

			cy.wrap(instance)
				.its('value')
				.should('be.instanceOf', MyClass);
		});

		it('can get an instance from a child container', () => {
			const instance = new DeferredValue();
			const childInstance = new MyClass();

			const SUT = () => {
				instance.set(useInstance(MyClass));
				return null;
			};

			const App = (
				<ContainerContext>
					<ContainerContextWithValue diKey={MyClass} value={childInstance}>
						<SUT />
					</ContainerContextWithValue>
				</ContainerContext>
			);

			cy.mount(App);

			cy.wrap(instance)
				.its('value')
				.should('be.equal', childInstance);
		});

		it('can get an instance from a child container overriding the parent', () => {
			const instance = new DeferredValue();
			const parentInstance = new MyClass();
			const childInstance = new MyClass();

			const SUT = () => {
				instance.set(useInstance(MyClass));
				return null;
			};

			cy.mount(
				<ContainerContextWithValue diKey={MyClass} value={parentInstance}>
					<ContainerContextWithValue diKey={MyClass} value={childInstance}>
						<SUT />
					</ContainerContextWithValue>
				</ContainerContextWithValue>
			);

			cy.wrap(instance)
				.its('value')
				.should('be.equal', childInstance)
				.should('not.be.equal', parentInstance);
		});

	});

	describe('withDependencies HOC', () => {

		it('can get an instance', () => {
			const instance = new DeferredValue();

			let SUT = ({ myInstance }) => {
				instance.set(myInstance);
				return null;
			};
			SUT = withDependencies({ myInstance: MyClass })(SUT);

			const App = (
				<ContainerContext>
					<SUT />
				</ContainerContext>
			);

			cy.mount(App);

			cy.wrap(instance)
				.its('value')
				.should('be.instanceOf', MyClass);
		});

		it('can get an instance from a child container', () => {
			const instance = new DeferredValue();
			const childInstance = new MyClass();

			let SUT = ({ myInstance }) => {
				instance.set(myInstance);
				return null;
			};
			SUT = withDependencies({ myInstance: MyClass })(SUT);

			const App = (
				<ContainerContext>
					<ContainerContextWithValue diKey={MyClass} value={childInstance}>
						<SUT />
					</ContainerContextWithValue>
				</ContainerContext>
			);

			cy.mount(App);

			cy.wrap(instance)
				.its('value')
				.should('be.equal', childInstance);
		});

		it('can get an instance from a child container overriding the parent', () => {
			const instance = new DeferredValue();
			const parentInstance = new MyClass();
			const childInstance = new MyClass();

			let SUT = ({ myInstance }) => {
				instance.set(myInstance);
				return null;
			};
			SUT = withDependencies({ myInstance: MyClass })(SUT);

			const App = (
				<ContainerContextWithValue diKey={MyClass} value={parentInstance}>
					<ContainerContextWithValue diKey={MyClass} value={childInstance}>
						<SUT />
					</ContainerContextWithValue>
				</ContainerContextWithValue>
			);

			cy.mount(App);

			cy.wrap(instance)
				.its('value')
				.should('be.equal', childInstance)
				.should('not.be.equal', parentInstance);
		});

		it.skip('can inject multiple values');

	});

});
