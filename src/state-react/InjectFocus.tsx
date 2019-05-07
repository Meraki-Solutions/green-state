import * as React from 'react';
import { InjectToggle } from './InjectToggle';

export const InjectFocus = ({ initialValue, children }) => (
  <InjectToggle initialValue={initialValue}>
    {({ isOn, on, off }) => (
      children({
        isFocused: isOn,
        onFocus: on,
        onBlur: off
      })
    )}
  </InjectToggle>
);
