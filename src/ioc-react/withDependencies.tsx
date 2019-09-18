import * as React from 'react';
import { DependencyContainerReactContext } from "./DependencyContainerReactContext";
import { Container } from '../ioc';

export function withDependencies<T>(inject: T) {
    return WrappedComponent => {
        return class InjectedComponent extends React.Component {
            static contextType = DependencyContainerReactContext;
            render() {
                return (
                    <WrappedComponent {...this.props} {...mapDependenciesToProps(this.context.container, inject)} />
                );
            }
        } as any; // enables use as decorator @withDependencies in typescript
    };
}

/**
 * @ignore
 */
function mapDependenciesToProps<T>(container: Container, inject: T): { [propName in keyof T]: any } {
  const dependencies = {} as any;

  Object.keys(inject).forEach(
      propName => {
          const dependencyKey = inject[propName];
          dependencies[propName] = container.get(dependencyKey);
      }
  );

  return dependencies;
}
