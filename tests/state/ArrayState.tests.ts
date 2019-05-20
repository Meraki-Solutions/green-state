import * as assert from 'assert';
import { ArrayState } from '../../src/state';
import { listenSeries } from '../support';

describe('ArrayState', () => {

  it('happy path', () => {

    const sut = new ArrayState(['first']);

    listenSeries(
      sut,

      // First
      state => {
        const { values, set } = state;
        assert.deepEqual(values, ['first']);
        setImmediate(() => set(['second']));
      },

      // Second
      state => {
        const { values, clear } = state;
        assert.deepEqual(values, ['second']);
        setImmediate(clear);
      },

      // Third, cleared
      state => {
        const { value, reset } = state;
        assert.deepEqual(value, []);
        setImmediate(reset);
      },

      // Fourth, reset
      state => {
        const { value, push } = state;
        assert.equal(value, ['first']);
        setImmediate(() => push('pushed'));
      },

      // Fifth, pushed
      state => {
        const { value, removeElement } = state;
        assert.equal(value, ['first', 'pushed']);
        setImmediate(() => removeElement('pushed'));
      },

      // Sixth, removed
      state => {
        const { value } = state;
        assert.equal(value, ['first']);
      }
    );
  });

});
