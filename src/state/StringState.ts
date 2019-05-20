import { State } from './State';

export class StringState extends State {
  private initialValue: string;

  constructor(initialValue = '') {
    super({ value: initialValue });
    this.initialValue = initialValue;
  }

  set = (value: string) => this.setState({ value });
  clear = () => this.setState({ value: '' });
  reset = () => this.setState({ value: this.initialValue });
}
