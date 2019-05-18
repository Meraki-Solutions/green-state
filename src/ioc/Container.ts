import 'reflect-metadata'; // Required by aurelia-dependency-injection
import { Container as AureliaContainer } from 'aurelia-dependency-injection';

interface IContainerConfiguration {
  debug?: boolean;
}

export class Container {
  private debug: boolean;
  private parent?: Container;
  private wrappedContainer: AureliaContainer;
  private configuration: IContainerConfiguration;

  constructor(configuration: IContainerConfiguration = {}) {
    const { debug = false, ...superConfiguration } = configuration;

    this.debug = debug;
    this.configuration = configuration;
    this.wrappedContainer = new AureliaContainer(superConfiguration);

    // Ensure that any resolution of Container inside the wrapped container gives us this one
    this.wrappedContainer.registerInstance(Container, this);
    this.parent = null;
  }

  /**
   * Ensure keys requested in a child container use deps from that container OR a non-root parent if available
   * Contrast with the key being resolved in the root and NOT using a dependency from the child container
   * For example in a container hierarchy c1 -> c2 (where c2 is a child of c1)
   * Given a key A depends on key B
   * And c2 knows how to resolve B
   * Then c2.get(A) should use the B from c2 and NOT a B from the root
   * Current implementation is to ensure that A gets auto registered in the same container where we find the dependency
   * then we can just proceed with normal resolution (super.get(A))
   */
  get = key => {
    if (key === Container) {
      return this;
    }

    const depGraph = this.buildDepGraph(key);

    if (this.debug) {
      // tslint:disable-next-line no-console
      console.log(JSON.stringify({
        depth: this.getContainerDepth(this),
        key: key.name,
        depGraph: (function recursivelyFormatDepGraph(nodes) {
          return nodes.map(
            ({ key: _key, resolvingContainer, deps }) => ({
              keyName: _key.name,
              depth: this.getContainerDepth(resolvingContainer),
              deps: recursivelyFormatDepGraph(deps)
            })
          );
        })(depGraph)
      }, null, 2));
    }

    this.autoRegisterDependencies(depGraph);

    if (!this.wrappedContainer.hasResolver(key) && this.parent) {
      return this.parent.get(key);
    }

    return this.wrappedContainer.get(key);
  }

  autoRegister = key => this.wrappedContainer.autoRegister(key);
  registerInstance = (key, instance) => this.wrappedContainer.registerInstance(key, instance);
  getResolver = (key) => this.wrappedContainer.getResolver(key);

  private buildDepGraph = key => {
    const recursivelyBuildGraph = (keys) => {
      return keys.map(
        _key => {
          const resolvingContainer = this.getContainerWithResolver(_key);
          const isResolvedSingleton = this.isAlreadyResolvedSingleton({ key: _key, container: resolvingContainer });
          return {
            key: _key,
            resolvingContainer,
            isResolvedSingleton,
            // Dont look any further in the graph
            deps: isResolvedSingleton ? [] : recursivelyBuildGraph(getDependencies(_key))
          };
        }
      );
    };
    return (recursivelyBuildGraph)([key]);
  }

  private AURELIA_STRATEGY_RESOLVER_INSTANCE_STRATEGY = 0;
  private isAlreadyResolvedSingleton = ({ key, container }) =>
    Boolean(container) &&
    container.getResolver(key).strategy === this.AURELIA_STRATEGY_RESOLVER_INSTANCE_STRATEGY

  private autoRegisterDependencies = depGraph => {
    const recursivelyAutoRegister = (nodes) => {
      nodes.forEach(
        node => {
          if (node.isResolvedSingleton) {
            return;
          }

          if (node.deps.length === 0) {
            return;
          }

          const nodeContainerDepth = this.getContainerDepth(node.resolvingContainer);
          const { depth: deepestDependencyDepth, deepest } = this.getDeepestDependency(node);
          if (deepestDependencyDepth > nodeContainerDepth) {
            deepest.resolvingContainer.autoRegister(node.key);
          }
          recursivelyAutoRegister(node.deps);
        }
      );
    };
    (recursivelyAutoRegister)(depGraph);
  }

  private getFlatDependencies = node => {
    return (function recursivelyGetFlatDependencies(nodes, all) {
      nodes.forEach(
        _node => {
          all.push(_node);
          recursivelyGetFlatDependencies(_node.deps, all);
        }
      );
      return all;
    })(node.deps, []);
  }

  private getDeepestDependency = node => {
    const flatDependencies = this.getFlatDependencies(node);
    let depth;
    let deepest;
    flatDependencies.forEach(
      depNode => {
        const depDepth = this.getContainerDepth(depNode.resolvingContainer);
        if (!depth || depDepth > depth) {
          depth = depDepth;
          deepest = depNode;
        }
      }
    );

    return { depth, deepest };
  }

  private getContainerWithResolver = key => {
    return (function recursivelyGetContainerWithResolver(container) {
      if (container.hasResolver(key)) {
        return container;
      }

      if (container.parent) {
        return recursivelyGetContainerWithResolver((container as any).parent);
      }

      return null;
    })(this);
  }

  hasResolver = key => this.wrappedContainer.hasResolver(key);

  private getContainerDepth = container => {
    let depth = 0;
    let currentContainer = container;

    while (currentContainer && currentContainer.parent) {
      depth++;
      currentContainer = currentContainer.parent;
    }

    return depth;
  }

  /**
   * Ensure createChild returns an instance of our new Container and not the base container
   */
  createChild = () => {
    const child = new Container(this.configuration);
    child.parent = this;

    return child;
  }

  /**
   * For each key in the wrapped container
   * If it is already resolved to an instance
   * And it that instance has a dispose method, then call instance.dispose
   * But don't call it on this Container, since that would cause an infinite loop
   */
  dispose = () => {
    const container = this.wrappedContainer;
    const { _resolvers: resolvers } = (container as any);
    Array.from(resolvers.keys()).forEach(key => {
      const isAlreadyResolvedSingleton = this.isAlreadyResolvedSingleton({ key, container: this.wrappedContainer });
      if (isAlreadyResolvedSingleton) {
        const instance = container.get(key);
        if (instance.dispose && typeof instance.dispose === 'function' && instance !== this) {
          instance.dispose();
        }
      }
    });
  }

}

// From aurelia invokers.js
function getDependencies(f) {
  if (!f.hasOwnProperty('inject')) {
    return [];
  }

  if (typeof f.inject === 'function') {
    return f.inject();
  }

  return f.inject;
}
