import * as React from 'react';
import { DependencyContainerContext, Inject } from '@symbiotic/green-state';
import { RenderInstance } from './RenderInstance';

class InjectedClass {
  title: string = 'With Dependencies';
  value: string = 'dependency';
}

class RootProvider extends DependencyContainerContext {
  containerMounted(container) {
    // do nothing
  }
}

export const WithDependenciesTest = () => (
  <RootProvider>
    <Inject diKey={InjectedClass}>
      {instance => <RenderInstance instance={instance} />}
    </Inject>
  </RootProvider>
);
