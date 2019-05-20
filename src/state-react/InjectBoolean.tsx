import * as React from 'react';
import { BooleanState } from '../state';
import { Subscribe } from './Subscribe';

interface IProps {
  children: (state: { value: boolean, set: (value: boolean) => void }) => React.ReactNode;
  initialValue?: boolean;
}

export const InjectBoolean = ({ initialValue, children }: IProps) => (
  <Subscribe to={() => new BooleanState(initialValue)}>
    {children}
  </Subscribe>
);
