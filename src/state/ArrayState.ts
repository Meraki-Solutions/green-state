import { State } from './State';

export class ArrayState<T = any> extends State<{values: T[]}> {
  private initialValues: T[];

  constructor(initialValues = []) {
    super({ values: initialValues });
    this.initialValues = initialValues;
  }

  set = (values: T[]) => this.setState({ values });
  clear = () => this.setState({ values: [] });
  reset = () => this.setState({ values: this.initialValues });

  push = (element: T) => this.setState({ values: this.state.values.concat([element]) });
  removeElement = (element: T) => this.setState({ values: this.state.values.filter(_element => _element !== element) });
}
