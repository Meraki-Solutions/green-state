import { State } from './State';

export class ValueState extends State {
  constructor(initialValue) {
    super(typeof initialValue === 'undefined' ? undefined : { value: initialValue });
  }

  set = value => this.setState({ value });
}
