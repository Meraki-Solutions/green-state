import { State } from './State';

export class ValueState<T = any> extends State<{value: T}> {
  constructor(initialValue: T) {
    super(typeof initialValue === 'undefined' ? undefined : { value: initialValue });
  }

  set = (value: T) => this.setState({ value });
}
