import * as React from 'react';
import { ValueState } from '../state';
import { Subscribe } from './Subscribe';

interface IProps {
  children: (state: { value: any, set: (value: any) => void }) => React.ReactNode;
  initialValue?: string;
}

export const InjectValue = ({ initialValue, children }: IProps) => (
  <Subscribe to={() => new ValueState(initialValue)}>
    {children}
  </Subscribe>
);
