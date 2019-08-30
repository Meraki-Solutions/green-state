import { Component } from 'react';
import { IStateCallback, IMergedState } from '../state';

interface ISubscribable<T = any> {
  subscribe: (callback: IStateCallback<T>) => () => void;
  dispose?: () => void;
}

interface IProps<T> {
  to: () => ISubscribable<T> | Promise<ISubscribable<T>>;
  children: (value: IMergedState<T>) => {};
  dispose: boolean;
}

interface IState<T> {
  value?: IMergedState<T>;
}

export class Subscribe<T = any> extends Component<IProps<T>, IState<T>> {
  state = { value: null };

  static defaultProps = {
      dispose: false,
  };

  private subscribedTo: ISubscribable<T>;
  private unsubscribe: () => void;
  private unmounted = false;

  async componentDidMount() {
    const state = await this.props.to();
    this.subscribedTo = state;

    this.unsubscribe = state.subscribe((value) => {
      if (!this.unmounted) {
        this.setState({ value });
      }
    });
  }

  componentWillUnmount() {
    const { dispose } = this.props;
    this.unmounted = true;

    if (dispose && this.subscribedTo && this.subscribedTo.dispose) {
      this.subscribedTo.dispose();
    } else if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    const { value } = this.state as IState<T>;

    if (!value) {
      return null;
    }

    return this.props.children(value);
  }
}
