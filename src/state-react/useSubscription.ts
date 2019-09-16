import { useEffect, useState } from 'react';
import { State, IMergedState } from '../state';

// tslint:disable-next-line max-line-length
export function useSubscription<T = any>(getState: (...args) => Promise<State> | State, subscriptionKey?: any): IMergedState<T> | undefined {
  const [reactState, setReactState] = useState(undefined);
  const useEffectInputs = (subscriptionKey === undefined ? [] : [subscriptionKey]);

  useEffect(() => {
    setReactState(undefined);

    let unsub: any;

    // Can't use async/await b/c useEffect must return nothing or an unsub function
    Promise.resolve().then(getState)
      .then((state: any) => {
        unsub = state.subscribe((value: any) => {
          setReactState(value);
        });

        // We can't know what to do with an error
        // The consumer needs to be sure getState handles any errors and never rethrows
      });

    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, useEffectInputs);

  return reactState;
}
