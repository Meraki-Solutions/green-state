type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// TODO: some day, try to get sub-class attributes explicitly included in IMergedState
// interface IExtra<S> extends Omit<State<S>, 'dispose' | 'get' | 'subscribe' | 'state' | 'setState'> {}
// export type IMergedState<T, S> = IExtra<S> & T;

export type IMergedState<T> = T & {[key: string]: any};

export type IStateCallback<T> = (state: IMergedState<T>) => void;

export class State<T = any> {
  public state: T;
  private subscriptions: Array<IStateCallback<T>> = [];

  constructor(initialState: T = null) {
    this.state = initialState;
  }

  setState = (newState: Partial<T>) => {
    this.state = { ...this.state, ...newState };
    this.publish();
  }

  private publish = () => {
    this.subscriptions.forEach(sub => sub(this.get()));
  }

  get = (): IMergedState<T> => {
    const { dispose, publish, get, subscribe, subscriptions, state, setState, ...rest } = this;
    return { ...rest, ...this.state };
  }

  subscribe = (callback: IStateCallback<T>) => {
    this.subscriptions.push(callback);
    if (this.state) {
      callback(this.get());
    }

    return () => {
      remove(callback, this.subscriptions);
    };
  }

  dispose = () => {
    this.subscriptions = [];
    this.subscribe = () => {
      throw new Error('Cannot subscribe to a disposed State instance');
    };
  }
}

/**
 * @ignore
 */
function remove<T>(item: T, array: T[]) {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
}
