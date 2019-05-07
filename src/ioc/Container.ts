import 'reflect-metadata'; // Required by aurelia-dependency-injection
import { Container as AureliaContainer } from 'aurelia-dependency-injection';

interface IContainerConfiguration {
  debug?: boolean
}

export class Container extends AureliaContainer {
  constructor(configuration: IContainerConfiguration = {}) {
    const { debug = false, ...superConfiguration } = configuration;
    super(superConfiguration);

    /**
     * Ensure keys requested in a child container use dependencies from that child container (or a parent that is not the root) if available
     * Contrast with the key being resolved in the root and NOT using a dependency from the child container where it was requested
     * For example in a container hierarchy c1 -> c2 (where c2 is a child of c1)
     * Given a key A depends on key B
     * And c2 knows how to resolve B
     * Then c2.get(A) should use the B from c2 and NOT a B from the root
     * Current implementation is to ensure that A gets auto registered in the same container where we find the dependency, then we can just proceed with normal resolution (super.get(A))
     */
    this.get = key => {
      const depGraph = buildDepGraph(key);

      if (debug) {
        console.log(JSON.stringify({
          depth: getContainerDepth(this),
          key: key.name,
          depGraph: (function recursivelyFormatDepGraph(nodes) {
            return nodes.map(
              ({ key, resolvingContainer, deps }) => ({
                keyName: key.name,
                depth: getContainerDepth(resolvingContainer),
                deps: recursivelyFormatDepGraph(deps)
              })
            );
          })(depGraph)
        }, null, 2));
      }

      autoRegisterDependencies(depGraph);

      return super.get(key);
    };

    const buildDepGraph = key => {
      return (function recursivelyBuildGraph(keys) {
        return keys.map(
          key => {
            const resolvingContainer = getContainerWithResolver(key);
            const isResolvedSingleton = isAlreadyResolvedSingleton({ key, resolvingContainer });
            return {
              key,
              resolvingContainer,
              isResolvedSingleton,
              // Dont look any further in the graph
              deps: isResolvedSingleton ? [] : recursivelyBuildGraph(getDependencies(key))
            }
          }
        )
      })([key])
    };

    const AURELIA_STRATEGY_RESOLVER_INSTANCE_STRATEGY = 0;
    const isAlreadyResolvedSingleton = ({ key, resolvingContainer }) =>
      Boolean(resolvingContainer) &&
      resolvingContainer.getResolver(key).strategy === AURELIA_STRATEGY_RESOLVER_INSTANCE_STRATEGY;

    const autoRegisterDependencies = depGraph => {
      (function recursivelyAutoRegister(nodes) {
        nodes.forEach(
          node => {
            if (node.isResolvedSingleton) {
              return;
            }

            if (node.deps.length === 0) {
              return;
            }

            const nodeContainerDepth = getContainerDepth(node.resolvingContainer);
            const { depth: deepestDependencyDepth, deepest } = getDeepestDependency(node);
            if (deepestDependencyDepth > nodeContainerDepth) {
              deepest.resolvingContainer.autoRegister(node.key);
            }
            recursivelyAutoRegister(node.deps);
          }
        );
      })(depGraph);
    };

    const getFlatDependencies = node => {
      return (function recursivelyGetFlatDependencies(nodes, all) {
        nodes.forEach(
          node => {
            all.push(node);
            recursivelyGetFlatDependencies(node.deps, all);
          }
        );
        return all;
      })(node.deps, [])
    };

    const getDeepestDependency = node => {
      const flatDependencies = getFlatDependencies(node);
      let depth, deepest;
      flatDependencies.forEach(
        depNode => {
          const depDepth = getContainerDepth(depNode.resolvingContainer);
          if (!depth || depDepth > depth) {
            depth = depDepth;
            deepest = depNode;
          }
        }
      );

      return { depth, deepest };
    }

    const getContainerWithResolver = key => {
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

    const getContainerDepth = container => {
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
    this.createChild = () => {
      let child = new Container(configuration);
      child.root = this.root;
      child.parent = this;
      return child;
    };

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
