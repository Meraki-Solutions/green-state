import * as React from 'react';
import { DependencyContainerContext, Inject } from '@symbiotic/green-state';
import { RenderInstance } from './RenderInstance';

class InjectedClass {
  title: string = 'Override Parent';
  value: string = '';
}

class RootProvider extends DependencyContainerContext {
  containerMounted(container) {
    const instance = new InjectedClass();
    instance.value = 'parent';
    container.registerInstance(InjectedClass, instance);
  }
}

class ChildProvider extends DependencyContainerContext {
  containerMounted(container) {
    const instance = new InjectedClass();
    instance.value = 'child';
    container.registerInstance(InjectedClass, instance);
  }
}

export const OverrideParentTest = () => (
  <RootProvider>
      <ChildProvider>
        <Inject diKey={InjectedClass}>
          {instance => <RenderInstance instance={instance} />}
        </Inject>
    </ChildProvider>
  </RootProvider>
);
