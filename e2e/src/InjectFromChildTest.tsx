import * as React from 'react';
import { DependencyContainerContext, Inject } from '@symbiotic/green-state';
import { RenderInstance } from './RenderInstance';

class InjectedClass {
  title: string = 'Inject from Child';
  value: string = 'injected';
}
class RootProvider extends DependencyContainerContext {
  containerMounted(container) {
    // do nothing
  }
}

class ChildProvider extends DependencyContainerContext {
  containerMounted(container) {
    const instance = new InjectedClass();
    instance.value = 'child';
    container.registerInstance(InjectedClass, instance);
  }
}

export const InjectFromChildTest = () => (
  <RootProvider>
      <ChildProvider>
        <Inject diKey={InjectedClass}>
          {instance => <RenderInstance instance={instance} />}
        </Inject>
    </ChildProvider>
  </RootProvider>
);
