import * as React from 'react';
import { DependencyContainerContext, useInstance } from '@symbiotic/green-state';
import { RenderInstance } from './RenderInstance';

class InjectedClass {
  title: string = 'Use Instance';
  value: string = 'useInstance';
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

const UseInstanceComponent = () => {
  const instance = useInstance(InjectedClass);
  return <RenderInstance instance={instance} />;
};

export const UseInstanceTest = () => {
  return (
    <RootProvider>
      <UseInstanceComponent />
    </RootProvider>
  );
};

export const UseInstanceFromChildTest = () => {
  return (
    <RootProvider>
      <ChildProvider>
        <UseInstanceComponent />
      </ChildProvider>
    </RootProvider>
  );
};

export const UseInstanceOverrideParentTest = () => {
  return (
    <RootProviderWithInstance>
      <ChildProvider>
        <UseInstanceComponent />
      </ChildProvider>
    </RootProviderWithInstance>
  );
};
