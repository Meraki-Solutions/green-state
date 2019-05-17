import { Component } from 'react';

interface ISubscribeProps {
  to: () => { subscribe: (callback) => () => void, dispose?: () => void };
  children: (value) => {};
  dispose: boolean;
}

interface ISubscribeState {
  value?: any;
}

export class Subscribe extends Component<ISubscribeProps, ISubscribeState> {
  state = { value: null };

  static defaultProps = {
      dispose: false,
  };

  private subscribedTo;
  private unsubscribe;
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
    const { value } = this.state;

    if (!value) {
      return null;
    }

    return this.props.children(value);
  }
}
