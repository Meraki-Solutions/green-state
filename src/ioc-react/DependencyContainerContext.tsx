import * as React from 'react';
import { DependencyContainerReactContext } from './DependencyContainerReactContext';
import { Container } from '../ioc';

interface DependencyContainerContextProps {
  container?: Container,
  children: React.ReactNode
}

interface DependencyContainerContextState {
  doneInjecting: boolean
}

export abstract class DependencyContainerContext extends React.Component<DependencyContainerContextProps, DependencyContainerContextState> {
  static contextType = DependencyContainerReactContext;

  private container;

  state = {
    doneInjecting: false
  }

  async componentDidMount() {
    // If you didnt provide your own container and you didnt implement containerMounted then you are just creating an empty child container
    // Which is likely a mistake (forgetting to implement containedMounted), so throw
    if (!this.props.container && !this.containerMounted) {
      throw new Error((this.constructor as any).name + ' must implement containerMounted');
    }

    // Use the provided container
    if (this.props.container) {
      this.container = this.props.container;
    }

    // Otherwise create a child container
    else if (this.context.container) {
      this.container = this.context.container.createChild();
    }

    // Otherwise create a new top-level container
    else {
      this.container = new Container();
    }

    if (this.containerMounted) {
      await this.containerMounted(this.container);
    }

    this.setState({ doneInjecting: true });
  }

  abstract containerMounted(container): void

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
