import { useEffect, useState } from 'react';
import { State, IMergedState } from '../state';

function invokeAsPromise(delegate) {
  try {
    return Promise.resolve(delegate());
  } catch (e) {
    return Promise.reject(e);
  }
}

// tslint:disable-next-line max-line-length
export function useSubscription<T = any>(getState: (...args) => Promise<State> | State, useEffectInputs: any[] = []): IMergedState<T> | undefined {
  const [reactState, setReactState] = useState(undefined);

  useEffect(() => {
    setReactState(undefined);

    let unsub;

    // Can't use async/await b/c useEffect must return nothing or an unsub function
    invokeAsPromise(getState)
      .then((state: any) => {
        unsub = state.subscribe((value: any) => {
          setReactState(value);
        });
      // We can't know what to do with an error
      // The consumer needs to be sure getState handles any errors and never rethrows
      }, (error: any) => {
        // tslint:disable-next-line no-console
        console.error('The first argument to useSubscription must not throw when invoked, but it did.', error);
      });

    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, useEffectInputs);

  return reactState;
}
