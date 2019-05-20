import * as React from 'react';
import { InjectToggle } from './InjectToggle';

interface IProps {
  children: (state: { isHovered: boolean, onMouseOver: () => void, onMouseOut: () => void }) => React.ReactNode;
  initialValue?: boolean;
}

export const InjectHover = ({ initialValue, children }: IProps) => (
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
