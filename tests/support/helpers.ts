export const listenOnce = (state, callback) => {
  const unsubscribe = state.subscribe(value => {
    if (unsubscribe) {
      unsubscribe();
    } else {
      callback(value);
    }
  });
};

export const listenSeries = (state, ...callbacks) => {
  let invocationCount = 0;
  const unsubscribe = state.subscribe(value => {
    callbacks[invocationCount](value);
    invocationCount++;
    if (invocationCount === callbacks.length) {
      unsubscribe();
    }
  });
};
