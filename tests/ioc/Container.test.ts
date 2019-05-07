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

  });

});
