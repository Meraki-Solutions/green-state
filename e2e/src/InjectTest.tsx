import * as React from 'react';
import { DependencyContainerContext, Inject } from '@symbiotic/green-state';
import { RenderInstance } from './RenderInstance';

class InjectedClass {
  title: string = 'Inject';
  value: string = 'inject';
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

export const InjectTest = () => (
  <RootProvider>
    <Inject diKey={InjectedClass}>
      {instance => <RenderInstance instance={instance} />}
    </Inject>
  </RootProvider>
);

export const InjectFromChildTest = () => (
  <RootProvider>
    <ChildProvider>
      <Inject diKey={InjectedClass}>
        {instance => <RenderInstance instance={instance} />}
      </Inject>
    </ChildProvider>
  </RootProvider>
);

export const InjectOverrideParentTest = () => (
  <RootProviderWithInstance>
    <ChildProvider>
      <Inject diKey={InjectedClass}>
        {instance => <RenderInstance instance={instance} />}
      </Inject>
    </ChildProvider>
  </RootProviderWithInstance>
);
