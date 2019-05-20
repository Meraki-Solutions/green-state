import * as React from 'react';
import { InjectToggle } from './InjectToggle';

interface IProps {
  children: (state: { isFocused: boolean, onFocus: () => void, onBlur: () => void }) => React.ReactNode;
  initialValue?: boolean;
}

export const InjectFocus = ({ initialValue, children }: IProps) => (
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
