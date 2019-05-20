import { State } from './State';

export class BooleanState extends State {
  constructor(initialValue = false) {
    super({ value: initialValue });
  }

  set = (value: boolean) => this.setState({ value });
}
