import * as React from 'react';
import { BooleanState } from '../state';
import { Subscribe } from './Subscribe';

interface IProps {
  children: (state: {
    isOn: boolean,
    isOff: boolean,
    on: () => void,
    off: () => void,
    toggle: () => void,
  }) => React.ReactNode;
  initialValue?: boolean;
}

export const InjectToggle = (props: IProps) => {
  const { initialValue, children } = props;

  return (
    <Subscribe to={() => new BooleanState(initialValue)}>
      {({ value: isOn, set, toggle }) => children({
        isOn,
        isOff:
        !isOn,
        toggle,
        on: () => set(true),
        off: () => set(false)
      })}
    </Subscribe>
  );
};
