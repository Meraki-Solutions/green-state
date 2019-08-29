import * as React from 'react';
import { DependencyContainerReactContext } from './DependencyContainerReactContext';
import { Container } from '../ioc';

interface IProps {
  [key: string]: any; // allow consumers to add their own props when they sub-class
  container?: Container;
  children: React.ReactNode;
}

interface IState {
  doneInjecting: boolean;
}

export abstract class DependencyContainerContext extends React.Component<IProps, IState> {
  static contextType = DependencyContainerReactContext;

  private container;

  state = {
    doneInjecting: false,
  };

  async componentDidMount() {
    // If you didn't provide your own container and you didn't implement containerMounted
    // then you are just creating an empty child container, which is likely a mistake
    if (!this.props.container && !this.containerMounted) {
      throw new Error((this.constructor as any).name + ' must implement containerMounted');
    }

    // Use the provided container
    if (this.props.container) {
      this.container = this.props.container;

    // Otherwise create a child container
    } else if (this.context.container) {
      this.container = this.context.container.createChild();

    // Otherwise create a new top-level container
    } else {
      this.container = new Container();
    }

    if (this.containerMounted) {
      await this.containerMounted(this.container);
    }

    this.setState({ doneInjecting: true });
  }

  componentWillUnmount() {
    this.container.dispose();
  }

  abstract containerMounted(container): void;

  render() {
    const { doneInjecting } = this.state;
    const { children } = this.props;

    if (!doneInjecting) {
      return this.renderLoading();
    }

    return (
      <DependencyContainerReactContext.Provider value={{ container: this.container }}>
        {children}
      </DependencyContainerReactContext.Provider>
    );
  }

  renderLoading() {
    return null;
  }
}
