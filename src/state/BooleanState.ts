import { State } from './State';

export class BooleanState extends State {
  constructor(initialValue = false) {
    super({ isOn: initialValue });

  }

  isOn = isOn => this.setState({ isOn });
  on = () => this.isOn(true);
  off = () => this.isOn(false);
}
