import * as React from 'react';
import { InjectToggle } from './InjectToggle';

export const InjectHover = ({ initialValue, children }) => (
  <InjectToggle initialValue={initialValue}>
    {({ isOn, on, off }) => (
      children({
        isHovered: isOn,
        onMouseOver: on,
        onMouseOut: off
      })
    )}
  </InjectToggle>
);
