import * as assert from 'assert';
import { BooleanState } from '../../src/state';
import { listenSeries } from '../support';

describe('BooleanState', () => {

  it('happy path', () => {

    const sut = new BooleanState(true);

    listenSeries(
      sut,

      // First
      state => {
        const { value, set } = state;
        assert.equal(value, true);
        setImmediate(() => set(false));
      },

      // Second
      state => {
        const { value, toggle } = state;
        assert.equal(value, false);
        setImmediate(toggle);
      },

      // Third
      state => {
        const { value } = state;
        assert.equal(value, true);
      },
    );

  });

});
