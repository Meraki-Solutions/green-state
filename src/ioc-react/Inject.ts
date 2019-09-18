import { ReactNode, Component } from 'react';
import { DependencyContainerReactContext } from './DependencyContainerReactContext';

interface IProps {
  diKey?: any;
  diKeys?: any[];
  children: (...values) => ReactNode;
  autoRegister?: boolean;
}

interface IState {
  value?: any;
}

export class Inject extends Component<IProps, IState> {
  static contextType = DependencyContainerReactContext;

  state = { value: null };

  componentDidMount() {
    console.log('hello from Inject')
    const { diKey, diKeys, autoRegister } = this.props;
    if (!diKey && !diKeys) {
      throw new Error('You must provide either a diKey prop or a diKeys prop to Inject');
    }

    // Always use an array so that values are passed as arguments to props.children
    const keysToInject = diKeys ? diKeys : [diKey];

    if (autoRegister) {
      keysToInject.forEach(key => this.context.container.autoRegister(key));
    }

    const value = keysToInject.map(key => this.context.container.get(key));

    this.setState({ value });
  }

  render() {
    const { value } = this.state;

    console.log('rendering', value)
    if (!value) {
      return null;
    }

    console.log('rendering children', value)
    return this.props.children(...value);
  }
}
