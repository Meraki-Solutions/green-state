import React from 'react';
import { ReactUnitTestRoot } from './ReactUnitTestRoot';

export const mount = (children) => {
  const App = (
    <ReactUnitTestRoot>
      {children}
    </ReactUnitTestRoot>
  );
  cy.mount(App);

  // return the dom element so that the consumer doesn't need to know what id we used
  return cy.get('#react-unit-test-root');
}