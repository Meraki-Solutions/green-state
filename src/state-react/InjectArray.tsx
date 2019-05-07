import * as React from 'react';
import { ArrayState } from '../state';
import { Subscribe } from './Subscribe';

export const InjectArray = ({ initialValues, children }) => (
  <Subscribe to={() => new ArrayState(initialValues)}>
    {children}
  </Subscribe>
);
