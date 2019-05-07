import { ReactNode, Component } from 'react';
import { DependencyContainerReactContext } from './DependencyContainerReactContext';

interface InjectProps {
  diKey?: any,
  diKeys?: any[],
  children: (value) => ReactNode,
  autoRegister?: boolean
}

interface InjectState {
  value?: any
}

export class Inject extends Component<InjectProps, InjectState> {
  static contextType = DependencyContainerReactContext;

  state = { value: null }

  componentDidMount() {
    const { diKey, diKeys, autoRegister } = this.props;

    if (autoRegister) {
      const keys = diKey ? [diKey] : diKeys;
      keys.forEach(key => this.context.container.autoRegister(key));
    }

    let value;
    if (diKey) {
      value = this.context.container.get(diKey);
    }
    else if (diKeys) {
      value = diKeys.map(key => this.context.container.get(key));
    }

    this.setState({ value });
  }

  render() {
    const { value } = this.state;

    if (!value) {
      return null;
    }

    return this.props.children(value);
  }
}
