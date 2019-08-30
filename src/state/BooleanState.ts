import { State } from './State';

export class BooleanState extends State<{value: boolean}> {
  constructor(initialValue = false) {
    super({ value: initialValue });
  }

  set = (value: boolean) => this.setState({ value });
  toggle = () => this.setState({ value: !this.state.value });
}
