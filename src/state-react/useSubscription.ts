import { useEffect, useState } from 'react';
import { State, IMergedState } from '../state';

// tslint:disable-next-line max-line-length
export function useSubscription<T = any>(getState: (...args) => Promise<State> | State, subscriptionKey?: any): IMergedState<T> | undefined {
  const [reactState, setReactState] = useState(undefined);
  const useEffectInputs = (subscriptionKey === undefined ? [] : [subscriptionKey]);

  useEffect(() => {
    setReactState(undefined);

    let unsub;

    // Can't use async/await b/c useEffect must return nothing or an unsub function
    return Promise.resolve().then(getState)
      .then((state: any) => {
        unsub = state.subscribe((value: any) => {
          setReactState(value);
        });
        return () => {
          if (unsub) {
            unsub();
          }
        };

        // We can't know what to do with an error
        // The consumer needs to be sure getState handles any errors and never rethrows
      });

  }, useEffectInputs);

  return reactState;
}
