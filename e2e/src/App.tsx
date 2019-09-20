import * as React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { InjectTest } from './InjectTest';
import { WithDependenciesTest } from './WithDependenciesTest';
import { UseInstanceTest } from './UseInstanceTest';
import { InjectFromChildTest } from './InjectFromChildTest';
import { NoRootProviderTest } from './NoRootProviderTest';
import { ErrorBoundary } from './ErrorBoundary';
import { OverrideParentTest } from './OverrideParentTest';

export const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <Route path="/inject" exact={true} component={InjectTest}/>
      <Route path="/withDependencies" exact={true} component={WithDependenciesTest}/>
      <Route path="/useInstance" exact={true} component={UseInstanceTest}/>
      <Route path="/injectFromChild" exact={true} component={InjectFromChildTest}/>
      <Route path="/noRootProvider" exact={true} component={NoRootProviderTest}/>
      <Route path="/overrideParent" exact={true} component={OverrideParentTest}/>
    </BrowserRouter>
  </ErrorBoundary>
);
