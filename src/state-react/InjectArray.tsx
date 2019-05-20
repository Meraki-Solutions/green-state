import * as React from 'react';
import { ArrayState } from '../state';
import { Subscribe } from './Subscribe';

interface IProps {
  children: (state: {}) => React.ReactNode;
  initialValues?: any[];
}

export const InjectArray = ({ initialValues, children }: IProps) => (
  <Subscribe to={() => new ArrayState(initialValues)}>
    {children}
  </Subscribe>
);
