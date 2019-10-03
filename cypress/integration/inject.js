import React from 'react'
import { Inject, useInstance, DependencyContainerContext, withDependencies } from '../support/sut';
import { fixReactDOMScope } from '../support';

class ContainerContext extends DependencyContainerContext {
  containerMounted() {
    // nuffin
  }
}

class ContainerContextWithValue extends DependencyContainerContext {
  containerMounted(container) {
    container.registerInstance(this.props.diKey, this.props.value);
  }
}

// We only do identity checks, so doesn't need any properties
class MyClass { }

class DeferredValue {
  constructor() {
    this.set = value => this.value = value;
  }
}

class RenderPropsSpy {
  constructor(content) {

    this.content = content;

    this.render = (...props) => {
      this.firstProp = props[0];
      this.props = props;

      return content ? <p>{content}</p> : null;
    };

  }
}

describe('Injecting a dependency', () => {

  // See https://github.com/bahmutov/cypress-react-unit-test/issues/51#issuecomment-494076389
  beforeEach(() => fixReactDOMScope(window));

  describe('<Inject> component', () => {

    const SUT = ({ diKey, children }) => (
      <Inject diKey={diKey}>
        {children}
      </Inject>
    );

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

  });

});
