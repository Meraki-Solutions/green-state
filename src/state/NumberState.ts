import { State } from './State';

export class NumberState extends State {
  constructor(initialValue: number) {
    super({ value: initialValue });
  }

  set = (value: number) => this.setState({ value });
}
