import * as React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { InjectTest, InjectFromChildTest, InjectOverrideParentTest } from './InjectTest';
import {
  WithDependenciesTest,
  WithDependenciesFromChildTest,
  WithDependenciesOverrideParentTest,
} from './WithDependenciesTest';
import { UseInstanceTest, UseInstanceFromChildTest, UseInstanceOverrideParentTest } from './UseInstanceTest';
import { NoRootProviderTest } from './NoRootProviderTest';
import { ErrorBoundary } from './ErrorBoundary';
import { OverrideParentTest } from './OverrideParentTest';

export const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <Route path="/inject" exact={true} component={InjectTest}/>
      <Route path="/inject/injectFromChild" exact={true} component={InjectFromChildTest}/>
      <Route path="/inject/overrideParent" exact={true} component={InjectOverrideParentTest}/>
      <Route path="/withDependencies" exact={true} component={WithDependenciesTest}/>
      <Route path="/withDependencies/injectFromChild" exact={true} component={WithDependenciesFromChildTest}/>
      <Route path="/withDependencies/overrideParent" exact={true} component={WithDependenciesOverrideParentTest}/>
      <Route path="/useInstance" exact={true} component={UseInstanceTest}/>
      <Route path="/useInstance/injectFromChild" exact={true} component={UseInstanceFromChildTest}/>
      <Route path="/useInstance/overrideParent" exact={true} component={UseInstanceOverrideParentTest}/>
      <Route path="/injectFromChild" exact={true} component={InjectFromChildTest}/>
      <Route path="/noRootProvider" exact={true} component={NoRootProviderTest}/>
      <Route path="/overrideParent" exact={true} component={OverrideParentTest}/>
    </BrowserRouter>
  </ErrorBoundary>
);
