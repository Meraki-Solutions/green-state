import { Container } from '../../src/ioc';
import * as assert from 'assert';

class ServiceConfig {}

class Service {
  static inject = [ServiceConfig]
  constructor(public config: ServiceConfig) {}
}

describe('Container', () => {

  it('Can resolve a class', () => {
    const sut = new Container();

    const serviceInstance = sut.get(Service);
    assert.ok(serviceInstance instanceof Service);
    assert.ok(serviceInstance.config instanceof ServiceConfig);
  });

  describe('Resolving dependencies in a child container', () => {

    it('should resolve in the child container if the requested key has a dependency that is already in the child container', () => {
      const parentContainer = new Container();
      const childContainer = parentContainer.createChild();

      // Add a dependency to the child container
      const childServiceConfig = { version: 'Child Version' };
      childContainer.registerInstance(ServiceConfig, childServiceConfig);

      // Ask the child to resolve something that depends on the service we just registered
      const instance = childContainer.get(Service);

      // It should have used the dependency we registered
      assert.ok(instance.config === childServiceConfig);
    });

    it('should resolve in the parent container if the request key has a dependency in the parent container', () => {
      const parentContainer = new Container();
      const childContainer = parentContainer.createChild();
      const config = new ServiceConfig();
      parentContainer.registerInstance(ServiceConfig, config);

      // Ask the child to resolve something that already exists in the parent
      const instance = childContainer.get(ServiceConfig);

      assert.ok(instance === config);
    });

  });

  /**
   * Note this is a regression test
   * Since our container proxied to the wrapped container
   * If it was asked for A, it would ask the wrapped container for A's dependencies
   * If A depended on Container, it would end up with an instance of the wrapped container which would be missing the correct resolution logic
   * Fixes bugs here https://github.com/symbioticlabs/scrumboard-tasks/issues/4250
   */
  it('A dependency can be injected with the Container instance and retrieve its dependencies', () => {
    class NonInstantiatableClass {
      constructor() {
        throw new Error('Nope!');
      }
    }

    class Service {
      static inject = [Container]

      public dependency;

      constructor(container) {
        this.dependency = container.get(NonInstantiatableClass);
      }
    }

    const sut = new Container();
    const desiredValue = { foo: 'bar' };
    sut.registerInstance(NonInstantiatableClass, desiredValue);
    const service = sut.get(Service);

    assert.ok(service.dependency === desiredValue);
  });

});
