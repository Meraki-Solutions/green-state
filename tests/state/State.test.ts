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

});

const listenOnce = (state, callback) => {
  let unsub = state.subscribe(value => {
    if (unsub) {
      unsub();
    } else {
      callback(value);
    }
  });
};
