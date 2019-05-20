import * as React from 'react';
import { NumberState } from '../state';
import { Subscribe } from './Subscribe';

interface IProps {
  children: (state: { value: number, set: (value: number) => void }) => React.ReactNode;
  initialValue?: number;
}

export const InjectNumber = ({ initialValue, children }: IProps) => (
  <Subscribe to={() => new NumberState(initialValue)}>
    {children}
  </Subscribe>
);
