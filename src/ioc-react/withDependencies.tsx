import * as React from 'react';
import { DependencyContainerReactContext } from "./DependencyContainerReactContext";

function mapDependenciesToProps(container, inject) {
    const dependencies = {};
    Object.keys(inject).forEach(
        propName => {
            const dependencyKey = inject[propName];
            dependencies[propName] = container.get(dependencyKey);
        }
    );

    return dependencies;
}

export function withDependencies(inject) {
    return WrappedComponent => {
        return class InjectedComponent extends React.Component {
            static contextType = DependencyContainerReactContext;
            render() {
                return (
                    <WrappedComponent {...this.props} {...mapDependenciesToProps(this.context.container, inject)} />
                );
            }
        };
    };
}
