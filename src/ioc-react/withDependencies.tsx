import * as React from 'react';
import { DependencyContainerReactContext } from "./DependencyContainerReactContext";
import { mapDependenciesToProps } from './mapDependenciesToProps';

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
