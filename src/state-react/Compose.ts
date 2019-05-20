import * as React from 'react';

// compose HOC
// "Borrowed" from https://github.com/renatorib/react-powerplug/blob/master/src/utils/compose.js
const compose = (...elements) => {
  const reversedElements = elements.reverse();

  return ({ children }) => {
    // Stack children arguments recursively and pass
    // it down until the last component that render children
    // with these stacked arguments
    function stackProps(i, _elements, propsList = []) {
      const element = _elements[i];
      const isTheLast = i === 0;

      // Check if is latest component.
      // If is latest then render children,
      // Otherwise continue stacking arguments
      const renderFn = props =>
        isTheLast
          ? children(...propsList.concat(props))
          : stackProps(i - 1, _elements, propsList.concat(props));

      // Clone a element if it's passed created as <Element initial={} />
      // Or create it if passed as just Element
      const elementFn: any = isElement(element)
        ? React.cloneElement
        : React.createElement;

      return elementFn(element, {}, renderFn);
    }

    return stackProps(elements.length - 1, reversedElements);
  };
};

export const Compose = ({ components, ...props }) => compose(...components)(props as any);

/**
 * @ignore
 */
const isElement = element => typeof element.type === 'function';
