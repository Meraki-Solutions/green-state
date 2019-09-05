import { Container } from '../ioc';

/**
 * @ignore
 */
export function mapDependenciesToProps<T>(container: Container, inject: T): { [propName in keyof T]: any } {
  const dependencies = {} as any;

  Object.keys(inject).forEach(
      propName => {
          const dependencyKey = inject[propName];
          dependencies[propName] = container.get(dependencyKey);
      }
  );

  return dependencies;
}
