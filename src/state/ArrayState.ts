import { State } from './State';

export class ArrayState extends State {
  private initialValues: any[];

  constructor(initialValues = []) {
    super({ values: initialValues });
    this.initialValues = initialValues;
  }

  set = values => this.setState({ values });
  clear = () => this.setState({ values: [] });
  reset = () => this.setState({ values: this.initialValues });

  push = element => this.setState({ values: this.state.values.concat([element]) });
  removeElement = element => this.setState({ values: this.state.values.filter(_element => _element !== element) });
}
