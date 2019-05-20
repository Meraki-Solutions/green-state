import * as React from 'react';
import { StringState } from '../state';
import { Subscribe } from './Subscribe';

interface IProps {
  children: (state: {}) => React.ReactNode;
  initialValue?: string;
}

export const InjectString = ({ initialValue, children }: IProps) => (
  <Subscribe to={() => new StringState(initialValue)}>
    {children}
  </Subscribe>
);
