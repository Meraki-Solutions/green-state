import * as React from 'react';

export const RenderInstance = ({ instance }) => (
  <>
    <p>Value: <span id="value">{instance.value}</span></p>
  </>
);
