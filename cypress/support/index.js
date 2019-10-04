// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-react-unit-test'

import ReactDOM from 'react-dom';

Cypress.on('window:load', win => {
  win.ReactDOM = window.ReactDOM || window.ReactDOM;
});

export function fixReactDOMScope(win) {
  if (win.ReactDOM !== ReactDOM) {
    win.ReactDOM = ReactDOM;
  }
}

export * from './RenderPropsSpy';
export * from './DeferredValue';
export * from './ContainerContext';
export * from './ContainerContextWithValue';
export * from './ExternallyResolvablePromise';
export * from './StateHistorySpy';
export * from './StateRenderPropsSpy';
export * from './ToggleChildrenComponent';
