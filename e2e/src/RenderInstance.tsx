import * as React from 'react';

export const RenderInstance = ({ instance }) => (
  <>
    <h1>{instance.title}</h1>
    <p>Value: <span id="value">{instance.value}</span></p>
  </>
);
