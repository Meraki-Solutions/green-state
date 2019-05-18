import { State } from '../../src/state';
import * as assert from 'assert';

describe('State', () => {

  it('should not pass subscribers unwanted properties and methods', () => {

    const sut = new State();
    sut.setState({ foo: 'bar' });

    sut.subscribe(value => {
      assert.deepEqual(value, { foo: 'bar' });
    });

  });

  it('should pass subscribers methods on a subclass of State', () => {
    class MyState extends State {
      setFoo = (foo) => this.setState({ foo });
    }

    const sut = new MyState({ foo: 'bar' });
    let lastValue;
    listenOnce(sut, value => {
      lastValue = value;
      assert.equal(value.foo, 'bar');
    });

    lastValue.setFoo('biz');
    listenOnce(sut, value => {
      assert.equal(value.foo, 'biz');
    });
  });

  context('dispose', () => {
    it('should not be able to subscribe to a dispose state', () => {

      const sut = new State();
      sut.dispose();

      let subscribeError;
      try {
        sut.subscribe(() => { /* This should throw an exception and never be invoked */ });
      } catch (e) {
        subscribeError = e;
      }

      const hasError = subscribeError && subscribeError.message === 'Cannot subscribe to a disposed State instance';
      assert.ok(hasError, 'Expected subscribing to dispose to throw an error but it succeeded');
    });

  });

});

const listenOnce = (state, callback) => {
  const unsub = state.subscribe(value => {
    if (unsub) {
      unsub();
    } else {
      callback(value);
    }
  });
};
