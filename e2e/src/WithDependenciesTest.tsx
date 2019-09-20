import * as React from 'react';
import { DependencyContainerContext, withDependencies } from '@symbiotic/green-state';
import { RenderInstance } from './RenderInstance';

class InjectedClass {
  title: string = 'With Dependencies';
  value: string = 'withDependencies';
}

class RootProvider extends DependencyContainerContext {
  containerMounted(container) {
    // do nothing
  }
}

@withDependencies({ instance: InjectedClass })
class WithDependenciesComponent extends React.Component<any> {
  render() {
    return <RenderInstance instance={this.props.instance} />;
  }
}

export const WithDependenciesTest = () => {
  return (
    <RootProvider>
      <WithDependenciesComponent />
    </RootProvider>
  );
};
