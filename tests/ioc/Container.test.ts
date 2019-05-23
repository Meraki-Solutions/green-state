import { Container } from '../../src/ioc';
import * as assert from 'assert';

// tslint:disable max-classes-per-file
class ServiceConfig {}

class Service {
  static inject = [ServiceConfig];
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

    it('should resolve in the child container if the requested key is already in the child container', () => {
      const parentContainer = new Container();
      const childContainer = parentContainer.createChild();

      // Add a dependency to the child container
      const childServiceConfig = { version: 'Child Version' };
      childContainer.registerInstance(ServiceConfig, childServiceConfig);

      // Ask the child to resolve something that depends on the service we just registered
      const instance = childContainer.get(ServiceConfig);

      // It should have used the dependency we registered
      assert.ok(instance === childServiceConfig);
    });

    it('should resolve in the child container if it has a dependency that is already in the child container', () => {
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

    it('should resolve in the child container when it overrides an instance in the parent', () => {
      const parentContainer = new Container();
      const childContainer = parentContainer.createChild();

      // Add a dependency to the parent container
      const parentServiceConfig = { version: 'Parent Version' };
      parentContainer.registerInstance(ServiceConfig, parentServiceConfig);

      // Add a dependency to the child container
      childContainer.autoRegister(ServiceConfig);

      // Ask the child to resolve something that depends on the service we just registered
      const instance = childContainer.get(ServiceConfig);

      // It should have used the dependency we registered
      assert.ok(instance !== parentServiceConfig);
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

    it('Should resolve with dep from the child container but still get a dep from the root container', () => {

      class RootService {}
      class ChildService {}

      class ServiceWithChildAndRootDeps {
        static inject = [RootService, ChildService];

        constructor(public rootService: RootService, public childService: ChildService) {}
      }

      const parent = new Container();
      const child = parent.createChild();

      const rootInstance = new RootService();
      parent.registerInstance(RootService, rootInstance);

      const childInstance = new ChildService();
      child.registerInstance(ChildService, childInstance);

      // child.autoRegister(ServiceWithChildAndRootDeps);
      const service = child.get(ServiceWithChildAndRootDeps);

      assert.ok(service.childService === childInstance, 'Expected childService to come from child container');
      assert.ok(service.rootService === rootInstance, 'Expected rootService to come from root container');
    });

    it('Should resolve with dep from the parent container and a dep from the root/grandparent container', () => {
      class GrandParentService {}
      class ParentService {}

      class ServiceWithParentAndGrandParentDeps {
        static inject = [GrandParentService, ParentService];

        constructor(public grandParentService: GrandParentService, public parentService: ParentService) {}
      }

      const grandParent = new Container();
      const parent = grandParent.createChild();
      const sut = parent.createChild();

      const grandParentInstance = new GrandParentService();
      grandParent.registerInstance(GrandParentService, grandParentInstance);

      const parentInstance = new ParentService();
      parent.registerInstance(ParentService, parentInstance);

      const service = sut.get(ServiceWithParentAndGrandParentDeps);

      assert.ok(service.parentService === parentInstance, 'Expected ParentService from parent');
      assert.ok(service.grandParentService === grandParentInstance, 'Expected GrandParentService from grandparent');
    });

  });

  /**
   * Note this is a regression test
   * Since our container proxied to the wrapped container
   * If it was asked for A, it would ask the wrapped container for A's dependencies
   * If A depended on Container, it would end up with an instance of the wrapped container
   * which would be missing the correct resolution logic
   * Fixes bugs here https://github.com/symbioticlabs/scrumboard-tasks/issues/4250
   */
  it('A dependency can be injected with the Container instance and retrieve its dependencies', () => {
    class NonInstantiatableClass {
      constructor() {
        throw new Error('Nope!');
      }
    }

    class ServiceDependsOnContainer {
      static inject = [Container];

      public dependency;

      constructor(container) {
        this.dependency = container.get(NonInstantiatableClass);
      }
    }

    const sut = new Container();
    const desiredValue = { foo: 'bar' };
    sut.registerInstance(NonInstantiatableClass, desiredValue);
    const service = sut.get(ServiceDependsOnContainer);

    assert.ok(service.dependency === desiredValue);
  });

  context('dispose', () => {

    it('should call the dispose method on resolved instances in the container', () => {
      const sut = new Container();

      let wasDisposeCalled = false;
      class ClassToDispose {
        dispose() {
          wasDisposeCalled = true;
        }
      }
      const instance = new ClassToDispose();
      sut.registerInstance(ClassToDispose, instance);

      sut.dispose();

      assert.ok(wasDisposeCalled, 'Expected dispose to have been called but it was not');
    });

    it('should NOT call the dispose method on keys that do not have an instance already in the container', () => {
      const sut = new Container();

      let wasDisposeCalled = false;
      class ClassToDispose {
        dispose() {
          wasDisposeCalled = true;
        }
      }
      sut.autoRegister(ClassToDispose);

      sut.dispose();

      assert.ok(!wasDisposeCalled, 'Expected dispose NOT to have been called but it was');
    });

    it('should NOT call the dispose method on keys that are resolved in the parent container but not the child', () => {
      const parentContainer = new Container();
      const childContainer = parentContainer.createChild();

      class ClassToDispose {
        constructor(private onDispose: () => void) {}
        dispose() {
          this.onDispose();
        }
      }
      let wasDisposeCalled = false;
      parentContainer.registerInstance(ClassToDispose, new ClassToDispose(() => { wasDisposeCalled = true; }));

      childContainer.dispose();

      assert.ok(!wasDisposeCalled, 'Expected dispose NOT to have been called but it was');
    });

    it('should NOT throw even if the dispose method on an instance throws', () => {
      const sut = new Container();

      class ClassWithDisposeThatThrows {
        dispose() {
          throw new Error('Dispose error!');
        }
      }

      sut.registerInstance(ClassWithDisposeThatThrows, new ClassWithDisposeThatThrows());

      const oldConsoleError = console.error; // tslint:disable-line no-console
      let lastConsoleErrorMessage;
      console.error = message => { lastConsoleErrorMessage = message; }; // tslint:disable-line no-console

      sut.dispose();

      console.error = oldConsoleError; // tslint:disable-line no-console

      const disposeWasLogged = lastConsoleErrorMessage.indexOf('The dispose method of an instance threw') === 0;
      assert.ok(disposeWasLogged, 'Expected dispose to have been called successfully');
    });

  });

});
