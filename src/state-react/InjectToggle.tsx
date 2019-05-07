import * as React from 'react';
import { BooleanState } from '../state';
import { Subscribe } from './Subscribe';

export const InjectToggle = ({ initialValue, children }) => (
  <Subscribe to={() => new BooleanState(initialValue)}>
    {({ isOn, on, off }) => children({ isOn, isOff: !isOn, on, off })}
  </Subscribe>
);
