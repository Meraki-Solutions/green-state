import * as React from 'react';
import { BooleanState } from '../state';
import { Subscribe } from './Subscribe';

interface IProps {
  children: (state: { isOn: boolean, isOff: boolean, on: () => void, off: () => void }) => React.ReactNode;
  initialValue?: boolean;
}

export const InjectToggle = ({ initialValue, children }: IProps) => (
  <Subscribe to={() => new BooleanState(initialValue)}>
    {({ isOn, on, off }) => children({ isOn, isOff: !isOn, on, off })}
  </Subscribe>
);
