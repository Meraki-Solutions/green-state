import React from 'react'
import { Inject, useInstance, withDependencies } from '../support/sut';
import { ContainerContext, ContainerContextWithValue, mount } from '../support';
import { fixReactDOMScope } from '../support';
import Sinon from 'sinon';

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
    let renderPropsSpy;

    beforeEach(() => {
      renderPropsSpy = Sinon.stub().returns(<p>Hi there!</p>)
    });

    it('can get an instance', () => {
      const App = (
        <ContainerContext>
          <SUT diKey={MyClass}>
            {renderPropsSpy}
          </SUT>
        </ContainerContext>
      );

      mount(App).as('mountedElement');

      cy.wrap(renderPropsSpy)
        .its('callCount').should('be', 1)
        .then(() => {
          assert.ok(renderPropsSpy.firstCall.args[0] instanceof MyClass, 'expected spy to get called with an instance of MyClass');
        });

      cy.get('@mountedElement').should('have.html', '<p>Hi there!</p>');
    });

    it('can get an instance from a child container', () => {
      const childInstance = new MyClass();

      const App = (
        <ContainerContext>
          <ContainerContextWithValue diKey={MyClass} value={childInstance}>
            <SUT diKey={MyClass}>
              {renderPropsSpy}
            </SUT>
          </ContainerContextWithValue>
        </ContainerContext>
      );

      mount(App);

      cy.then(() => {
        assert.ok(renderPropsSpy.firstCall.calledWith(childInstance));
      });
    });

    it('can get an instance from a child container overriding the parent', () => {
      const parentInstance = new MyClass();
      const childInstance = new MyClass();

      const App = (
        <ContainerContextWithValue diKey={MyClass} value={parentInstance}>
          <ContainerContextWithValue diKey={MyClass} value={childInstance}>
            <SUT diKey={MyClass}>
              {renderPropsSpy}
            </SUT>
          </ContainerContextWithValue>
        </ContainerContextWithValue>
      )

      cy.mount(App);

      cy.then(() => {
        assert.ok(renderPropsSpy.firstCall.calledWith(childInstance));
      });
    });

    it.skip('can inject multiple values');

  });

  describe('useInstance hook', () => {
    let instanceSpy,
        SUT;

    beforeEach(() => {
      instanceSpy = Sinon.spy();

      SUT = () => {
        const instance = useInstance(MyClass);
        instanceSpy(instance);
        return null;
      };

    });

    it('can get an instance', () => {
      const App = (
        <ContainerContext>
          <SUT />
        </ContainerContext>
      );

      cy.mount(App);

      cy.then(() => {
        assert.ok(instanceSpy.firstCall.args[0] instanceof MyClass, 'expected spy to get called with an instance of MyClass');
      });
    });

    it('can get an instance from a child container', () => {
      const childInstance = new MyClass();

      const App = (
        <ContainerContext>
          <ContainerContextWithValue diKey={MyClass} value={childInstance}>
            <SUT />
          </ContainerContextWithValue>
        </ContainerContext>
      );

      cy.mount(App);

      cy.then(() => {
        assert.ok(instanceSpy.firstCall.calledWith(childInstance));
      });
    });

    it('can get an instance from a child container overriding the parent', () => {
      const parentInstance = new MyClass();
      const childInstance = new MyClass();

      cy.mount(
        <ContainerContextWithValue diKey={MyClass} value={parentInstance}>
          <ContainerContextWithValue diKey={MyClass} value={childInstance}>
            <SUT />
          </ContainerContextWithValue>
        </ContainerContextWithValue>
      );

      cy.then(() => {
        assert.ok(instanceSpy.firstCall.calledWith(childInstance));
      });
    });

  });

  describe('withDependencies HOC', () => {
    let instanceSpy,
      SUT;

    beforeEach(() => {
      instanceSpy = Sinon.spy();

      // base component is a simply a component that spies on the contstructor props
      SUT = ({ myInstance }) => {
        instanceSpy(myInstance);
        return null;
      };

      // now use the HOC to inject MyClass
      SUT = withDependencies({ myInstance: MyClass })(SUT);

    });

    it('can get an instance', () => {
      const App = (
        <ContainerContext>
          <SUT />
        </ContainerContext>
      );

      cy.mount(App);

      cy.then(() => {
        assert.ok(instanceSpy.firstCall.args[0] instanceof MyClass, 'expected spy to get called with an instance of MyClass');
      });
    });

    it('can get an instance from a child container', () => {
      const childInstance = new MyClass();

      const App = (
        <ContainerContext>
          <ContainerContextWithValue diKey={MyClass} value={childInstance}>
            <SUT />
          </ContainerContextWithValue>
        </ContainerContext>
      );

      cy.mount(App);

      cy.then(() => {
        assert.ok(instanceSpy.firstCall.calledWith(childInstance));
      });
    });

    it('can get an instance from a child container overriding the parent', () => {
      const parentInstance = new MyClass();
      const childInstance = new MyClass();

      const App = (
        <ContainerContextWithValue diKey={MyClass} value={parentInstance}>
          <ContainerContextWithValue diKey={MyClass} value={childInstance}>
            <SUT />
          </ContainerContextWithValue>
        </ContainerContextWithValue>
      );

      cy.mount(App);

      cy.then(() => {
        assert.ok(instanceSpy.firstCall.calledWith(childInstance));
      });
    });

    it.skip('can inject multiple values');

  });

});
