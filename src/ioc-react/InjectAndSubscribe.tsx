import * as React from 'react';
import { Inject } from './Inject';
import { Subscribe } from '../state-react';

interface IProps {
  children: (value) => React.ReactNode;
  diKey: any;
}

export const InjectAndSubscribe = ({ children, diKey }: IProps) => (
  <Inject diKey={diKey}>
    {instance => (
      <Subscribe to={() => instance}>
        {value => children(value)}
      </Subscribe>
    )}
  </Inject>
);
