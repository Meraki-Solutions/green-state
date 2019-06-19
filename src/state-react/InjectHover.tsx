import * as React from 'react';
import { InjectToggle } from './InjectToggle';

interface IProps {
  children: (state: { isHovered: boolean, onMouseOver: () => void, onMouseOut: () => void }) => React.ReactNode;
  initialValue?: boolean;
}

/**
 * #### Example
 *
 * ```js
 * const MyButton = () => (
 *   <InjectHover>
 *     {({ isHovered, onMouseOver, onMouseOut }) => (
 *       <button onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
 *         {isHovered ? 'IM HOVERED' : 'IM NOT HOVERED'}
 *       </button>
 *     )}
 *   </InjectHover>
 * );
 * ```
 */
export const InjectHover = (props: IProps) => {
  const { initialValue, children } = props;

  return (
    <InjectToggle initialValue={initialValue}>
      {({ isOn, on, off }) => (
        children({
          isHovered: isOn,
          onMouseOver: on,
          onMouseOut: off
        })
      )}
    </InjectToggle>
  );
};
