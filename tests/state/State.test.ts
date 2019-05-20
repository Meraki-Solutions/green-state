import * as assert from 'assert';
import { State } from '../../src/state';
import { listenOnce, listenSeries } from '../support';

describe('State', () => {

  it('happy path', () => {
    const sut = new State({ some: 'value' });

    listenSeries(
      sut,

      // First
      state => {
        assert.deepEqual(state, { some: 'value' });
        setImmediate(() => sut.setState({ some: 'otherValue' }));
      },

      // Second
      state => {
        assert.deepEqual(state, { some: 'otherValue' });
      },
    );
  });

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

  it('should be able to unsubscribe', () => {

    const sut = new State({ not: 'relevant' });

    let subscribeCallCount = 0;
    const unsubscribe = sut.subscribe(() => {
      subscribeCallCount++;
    });

    assert.equal(subscribeCallCount, 1);

    unsubscribe();

    sut.setState({ who: 'cares' });
    assert.equal(subscribeCallCount, 1);
  });

  it('callback should not be called if no state was been set', () => {
    const sut = new State(/* No state set */);

    let subscribeCallCount = 0;
    const unsubscribe = sut.subscribe(() => {
      subscribeCallCount++;
    });

    assert.equal(subscribeCallCount, 0);
  });

  context('dispose', () => {
    it('should not be able to subscribe to a disposed state', () => {

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
