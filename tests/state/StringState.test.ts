import * as assert from 'assert';
import { StringState } from '../../src/state';
import { listenSeries } from '../support';

// TODO: why do I suddenly need this?

// tslint:disable-next-line: ban-types
declare const setImmediate: Function;

describe('StringState', () => {

  it('happy path', () => {

    const sut = new StringState('first');

    listenSeries(
      sut,

      // First
      state => {
        const { value, set } = state;
        assert.equal(Object.keys(state).length, 5);
        assert.equal(value, 'first');
        setImmediate(() => set('second'));
      },

      // Second
      state => {
        const { value, clear } = state;
        assert.equal(value, 'second');
        setImmediate(clear);
      },

      // Third, cleared
      state => {
        const { value, reset } = state;
        assert.equal(value, '');
        setImmediate(reset);
      },

      // Fourth, reset
      state => {
        const { value } = state;
        assert.equal(value, 'first');
      }
    );
  });

});
