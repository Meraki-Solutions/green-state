import * as React from 'react';
import { StringState } from '../state';
import { Subscribe } from './Subscribe';

export const InjectString = ({ initialValue, children }) => (
  <Subscribe to={() => new StringState(initialValue)}>
    {children}
  </Subscribe>
);
