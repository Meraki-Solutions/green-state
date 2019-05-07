import { State } from './State';

export class CompositeState extends State {
  constructor(...states) {
    super({ values: states.map(() => null) });

    const unsubscribes = states.map((state, index) =>
      state.subscribe(state => {
        const newValues = [...this.get()];
        newValues[index] = state;

        this.setState({ values: newValues });
      }));

    const superDispose = this.dispose;
    this.dispose = () => {
      superDispose();
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };

    this.get = () => this.state.values;
  }
}
