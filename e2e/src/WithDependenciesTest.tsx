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

class RootProviderWithInstance extends DependencyContainerContext {
  containerMounted(container) {
    container.registerInstance(InjectedClass, new InjectedClass());
  }
}

class ChildProvider extends DependencyContainerContext {
  containerMounted(container) {
    const instance = new InjectedClass();
    instance.value = `${instance.value} FromChild`;
    container.registerInstance(InjectedClass, instance);
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

export const WithDependenciesFromChildTest = () => {
  return (
    <RootProvider>
      <ChildProvider>
        <WithDependenciesComponent />
      </ChildProvider>
    </RootProvider>
  );
};

export const WithDependenciesOverrideParentTest = () => (
  <RootProviderWithInstance>
    <ChildProvider>
        <WithDependenciesComponent />
    </ChildProvider>
  </RootProviderWithInstance>
);
