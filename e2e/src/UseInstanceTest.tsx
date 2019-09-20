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
