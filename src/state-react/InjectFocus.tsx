import * as React from 'react';
import { InjectToggle } from './InjectToggle';

interface IProps {
  children: (state: { isFocused: boolean, onFocus: () => void, onBlur: () => void }) => React.ReactNode;
  initialValue?: boolean;
}

export const InjectFocus = (props: IProps) => {
  const { initialValue, children } = props;

  return (
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
};
