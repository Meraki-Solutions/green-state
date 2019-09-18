import './setupEnzyme';
import * as React from 'react';
import * as assert from 'assert';
import { DependencyContainerContext, Inject } from '../../src/ioc-react';
import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

// move to setup enzyme
Enzyme.configure({ adapter: new Adapter() });

class WTF extends React.Component{
  state = { count : 1 };
  componentDidMount(){
    setTimeout(() => {
      this.setState({ count : 3 });
    }, 100)

  }
  render(){
    const { count } = this.state;
    return <h1>wtf {count}</h1>;
  }
}

describe('ioc', () => {
  it('can leverage <Inject/> to get things out of the container', async () => {
    let injectedInstance;

    const App = () => (
      <IOCProvider>
        <Inject diKey={SomeComplexComposite}>
          {(instance) => {
            injectedInstance = instance;
            // this is a render loop, but that isn't the point of the test, so return null
            return <h1>Some Children</h1>;
          }}
        </Inject>
      </IOCProvider>
    );

    const comp = await render(App);
    // const comp = await render(WTF);
    assert.equal(injectedInstance.constructor, SomeComplexComposite, 'expected to get an instance of TestClass');
    console.log('test', comp.debug())
    assert.equal(comp.html(), '<h1>Some Children</h1>');
    // can re-render, and still only get the one instance
    // renders children
  });
  it('can leverage @withDependencies to inject an instance into a class component');
  it('can leverage `useInstance` to inject an instance into a render function using react hooks');
  it('must have a root IOC provider');
  it('can inject from a hierarchical container');
  it('can inject from a hierarchical container overriding a parent container');
  it('hierarchical containers dispose instances');
});

// tslint:disable-next-line: max-classes-per-file
class SomeComplexComposite {
  static constructedCount = 0;
  constructor() {
    SomeComplexComposite.constructedCount++;
  }
}

// tslint:disable-next-line: max-classes-per-file
class IOCProvider extends DependencyContainerContext{
  containerMounted(container) {
    // do nothing
  }
}

async function render(Component) {
  const enzymeComponent = Enzyme.mount(<Component />);
  console.log('html before', enzymeComponent.html());
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log('html after', enzymeComponent.html());
  return enzymeComponent;
}
