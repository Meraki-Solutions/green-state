import React from 'react';

/**
 * This class solves 2 problems
 * 1. we need a way to find our dom element, so we give it an id
 * 2. the top component we render must have a display name (a constraint of https://github.com/bahmutov/cypress-react-unit-test)
 */
export class ReactUnitTestRoot extends React.Component {
  render(){
    return (
      <div id="react-unit-test-root">
        {this.props.children}
      </div>
    )
  }
}