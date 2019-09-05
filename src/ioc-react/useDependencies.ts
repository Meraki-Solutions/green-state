import { useContext } from 'react';
import { DependencyContainerReactContext } from '../ioc-react';
import { mapDependenciesToProps } from './mapDependenciesToProps';

export function useDependencies<T>(diKeys: T) {
  const { container } = useContext(DependencyContainerReactContext);

  return mapDependenciesToProps<{ [propName in keyof T]: any }>(container, diKeys);
}
