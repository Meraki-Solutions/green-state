import { useContext } from 'react';
import { DependencyContainerReactContext } from '../ioc-react';

export function useInstance(dependencyKey: any) {
  const { container } = useContext(DependencyContainerReactContext);

  return container.get(dependencyKey);
}
