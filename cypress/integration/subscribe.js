import React from 'react'
import {
  fixReactDOMScope,
  ExternallyResolvablePromise,
  ToggleChildrenComponent,
  mount
} from '../support';
import Sinon from 'sinon';
import { State, Subscribe, useSubscription } from '../support/sut';

describe('Subscribing to state', () => {

  // See https://github.com/bahmutov/cypress-react-unit-test/issues/51#issuecomment-494076389
  beforeEach(() => fixReactDOMScope(window));

  describe('<Subscribe> component', () => {
    let renderPropsSpy,
        state;

    beforeEach(() => {
      renderPropsSpy = Sinon.stub().returns(null);
      state = new State({ value: 'first state' });
    })

    it('can get the initial value', () => {
      state = new State({ value: 'The initial value' });

      cy.mount((
        <Subscribe to={() => state}>
          {renderPropsSpy}
        </Subscribe>
      ));

      cy.then(() => {
        assert.ok(renderPropsSpy.firstCall.calledWith({ value: 'The initial value' }));
      });
    });

    it('can render the children', () => {
      renderPropsSpy.returns(<p>Hi There!</p>)

      mount((
        <Subscribe to={() => state}>
          {renderPropsSpy}
        </Subscribe>
      )).should('have.html', '<p>Hi There!</p>');
    });

    it(`doesn't render when there is no initial value`, () => {
      const state = new State();

      const SUT = () => (
        <Subscribe to={() => state}>
          {renderPropsSpy}
        </Subscribe>
      );

      cy.mount(<SUT />);

      cy.then(() => {
        assert.equal(renderPropsSpy.callCount, 0);
      });
    });

    it(`when props.to is async, doesn't render until it resolves`, () => {
      const statePromise = new ExternallyResolvablePromise();

      const SUT = () => (
        <Subscribe to={() => statePromise}>
          {renderPropsSpy}
        </Subscribe>
      );

      cy.mount(<SUT />);

      cy.then(() => {
        assert.equal(renderPropsSpy.callCount, 0);
        statePromise.resolve(new State({ value: 'The async value' }));
      });

      cy.then(() => {
        assert.equal(renderPropsSpy.callCount, 1);
        assert.ok(renderPropsSpy.firstCall.calledWith({ value: 'The async value' }));
      });
    });

    it(`renders when state changes`, () => {
      cy.mount((
        <Subscribe to={() => state}>
          {renderPropsSpy}
        </Subscribe>
      ));

      cy.then(() => {
        state.setState({ value: 'Second State' });
      });

      cy.then(() => {
        assert.equal(renderPropsSpy.callCount, 2);
        assert.ok(renderPropsSpy.getCall(1).calledWith({ value: 'Second State' }));
      });
    });

    it(`unsubscribes on unmount`, () => {
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

    it.skip(`re-subscribes on unmount/remount`, () => {
      let stateCount = 0;
      const getState = () => {
        stateCount++;
        return new State({ value: stateCount });
      };

      class SUT extends React.Component {
        state = { name: 'Jon' }

        render() {
          return (
            <Subscribe to={getState} key={this.state.name}>
              {renderPropsSpy}
            </Subscribe>
          );
        }
      }

      cy.mount(<SUT />)

      // Should have value 1 because it was calle donce
      cy.then(() => {
        assert.ok(renderPropsSpy.firstCall.calledWith({ value : 1 }),);
      });

      // Change the state used as Subscribe.key
      cy.get(SUT)
        .invoke('setState', { name: 'Ben' });

      cy.then(() => {
        assert.ok(renderPropsSpy.getCall(1).calledWith({ value : 2 }),);
      });

    });

    // Couldn't get this test passing headlessly
    // Hopefully cypress gets newer version of electron soon?
    // https://github.com/cypress-io/cypress/pull/4720
    it.skip(`when props.dispose is set, state.dispose is called on unmount`, () => {
      // const state = new State();
      // const disposeCalled = new DeferredValue();
      // state.dispose = () => disposeCalled.set(true);

      // const SUT = () => (
      //     <Subscribe to={() => state} dispose={true}>
      //       {() => null}
      //     </Subscribe>
      // );

      // const App = (
      //   <ToggleChildrenComponent>
      //     <SUT />
      //   </ToggleChildrenComponent>
      // );

      // cy.mount(App);

      // cy.get(App)
      //   .invoke('unmountChildren');

      // cy.wrap(disposeCalled)
      //   .invoke('valueOf')
      //   .should('be.true');
    });

  });

  describe('useSubscription hook', () => {
    let state,
        stateHistorySpy;

    beforeEach(() => {
      state = new State();
      stateHistorySpy = Sinon.spy();
    })

    it('can get the initial value', () => {
      state = new State({ value : 'initial value' });

      const TestComponent = () => {
        const currentState = useSubscription(() => state);
        stateHistorySpy(currentState);

        return null;
      };

      cy.mount(<TestComponent />);

      cy.wrap(stateHistorySpy)
        .its('callCount')
        .should('equal', 2)
        .then(() => {
          // first render will be undefined because the sync nature of the hooks api makes it impractical to emit
          // the initial value on first render
          assert.equal(stateHistorySpy.getCall(0).args[0], undefined);
          assert.deepEqual(stateHistorySpy.getCall(1).args[0], { value: 'initial value' });
        })
    });

    it(`when getState is async, renders when it resolves`, () => {
      state = new State({ value: 'The async value' });
      const statePromise = new ExternallyResolvablePromise();

      const TestComponent = () => {
        const currentState = useSubscription(() => statePromise);
        stateHistorySpy(currentState);

        return null;
      };

      cy.mount(<TestComponent />);

      statePromise.resolve(state);

      cy.wrap(stateHistorySpy)
        .its('callCount')
        .should('equal', 2)
        .then(() => {
          assert.deepEqual(stateHistorySpy.getCall(1).args[0], { value: 'The async value' });
        })
    });

    it(`renders when state changes`, () => {
      const TestComponent = () => {
        const currentState = useSubscription(() => state);
        stateHistorySpy(currentState);

        return null;
      };

      cy.mount(<TestComponent />);

      state.setState({ value: 'Another value' });

      cy.wrap(stateHistorySpy)
        .its('callCount')
        .should('equal', 2) // would expect 3, but guessing some batching is causing 2
        .then(() => {
          assert.deepEqual(stateHistorySpy.getCall(1).args[0], { value: 'Another value' });
        });
    });

    it(`unsubscribes on unmount`, () => {
      const TestComponent = () => {
        useSubscription(() => state);
        return null;
      };

      const App = (
        <ToggleChildrenComponent>
          <TestComponent />
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

    // Couldn't get this test to pass
    it.skip(`re-subscribes when subscriptionKey changes`, () => {
      let stateCount = 0;
      const getState = () => {
        stateCount++;
        return new State({ value: stateCount === 1 ? 'First State' : 'Re-subscribed State' });
      };

      const SUT = ({ subscriptionKeyValue }) => {
        console.log(subscriptionKeyValue);
        const currentState = useSubscription(getState, subscriptionKeyValue);
        stateHistorySpy(currentState);

        return null;
      };

      class App extends React.Component {
        state = { value: 'anything' }

        render() {
          return (
            <SUT subscriptionKeyValue={this.state.value} />
          );
        }
      }

      cy.mount(<App />)

      // Should have the initial state
      cy.wrap(stateHistorySpy)
        .invoke('getCount')
        .should('equal', 2);

      cy.wrap(stateHistorySpy)
        .invoke('getMostRecentState')
        .its('value')
        .should('equal', 'First State');

      // Change the state used as Subscribe.key
      cy.get(App)
        .invoke('setState', { value: 'anything else' });

      cy.wrap(stateHistorySpy)
        .invoke('getCount')
        .should('equal', 3);

      cy.wrap(stateHistorySpy, { timeout: 20000 })
        .invoke('getMostRecentState')
        .its('value')
        .should('equal', 'Re-subscribed State');
    });

  });

});
