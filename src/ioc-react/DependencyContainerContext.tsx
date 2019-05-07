import * as React from 'react';
import { DependencyContainerReactContext } from './DependencyContainerReactContext';
import { Container } from '../ioc';

interface DependencyContainerContextProps {
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
    if (!this.containerMounted) {
      throw new Error((this.constructor as any).name + ' must implement containerMounted');
    }

    if (this.context.container) {
      this.container = this.context.container.createChild();
    }
    else {
      this.container = new Container();
    }

    await this.containerMounted(this.container);

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
