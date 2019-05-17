export class State {
  public state: any;
  private subscriptions: Array<(state) => {}> = [];

  constructor(initialState = null) {
    this.state = initialState;
  }

  setState = (newState) => {
    this.state = { ...this.state, ...newState };
    this.publish();
  };

  private publish = () => {
    this.subscriptions.forEach(sub => sub(this.get()));
  };

  get = () => {
    const { dispose, publish, get, subscribe, subscriptions, state, setState, ...rest } = this;
    return { ...rest, ...this.state };
  };

  subscribe = callback => {
    this.subscriptions.push(callback);
    if (this.state) {
      callback(this.get());
    }

    return () => {
      remove(callback, this.subscriptions);
    };
  };

  dispose = () => {
    this.subscriptions = [];
  };
}

function remove(item, array) {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
}
