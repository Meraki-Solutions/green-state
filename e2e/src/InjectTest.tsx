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

export const InjectTest = () => (
  <RootProvider>
    <Inject diKey={InjectedClass}>
      {instance => <RenderInstance instance={instance} />}
    </Inject>
  </RootProvider>
);
