import * as React from 'react';
import { Inject } from '@symbiotic/green-state';
import { RenderInstance } from './RenderInstance';

class InjectedClass {
  title: string = 'No Root Provider';
  value: string = 'injected';
}

export const NoRootProviderTest = () => (
  <Inject diKey={InjectedClass}>
    {instance => <RenderInstance instance={instance} />}
  </Inject>
);
