import { DependencyContainerContext } from '../support/sut';

export class ContainerContextWithValue extends DependencyContainerContext {
  containerMounted(container) {
    container.registerInstance(this.props.diKey, this.props.value);
  }
}
