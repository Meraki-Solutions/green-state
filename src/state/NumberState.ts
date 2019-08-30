import { State } from './State';

export class NumberState extends State<{value: number}> {
  constructor(initialValue: number) {
    super({ value: initialValue });
  }

  set = (value: number) => this.setState({ value });
}
