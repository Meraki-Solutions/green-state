# Green State

Green State is a composable state management library for Javascript Apps with first-class support of DI/IoC. It helps you write complex applications that can evolve in a sustainable way as requirements change by encapsulating state so it is easy to reason about what parts of the system would be impacted by a given change. It also encourages composition by providing a set of small re-usable units that can be combined in a variety of different ways.

You can use Green State together with React using the provided bindings or you could easily writer a few small adapters to use it with any other view library.

## Installation

Green State is available as a package on NPM for use with a module bundler or in a Node application:

```shell
npm install --save @symbiotic/green-state
```

## Basic Example

The state of your app is stored in State objects which also provide methods for changing the state.
A State object is any javascript object that meets simple interface, but most of the time it extends the State class provided by Green State.

```js
const myState = {
  // Merge some keys into the state, just like React's this.setState when passed an object
  setState(objectToMergeWithExistingState) {}

  // Get the current state
  get() {}

  // Subscribe to state changes, callback will be called every time state changes
  subscribe(callback) {}
};
```

To provide your own state class, simply sub-class the provided State class. Any methods you add will be available to subscribers.
If you don't like classes, you can also use any object that meets the State interface of setState, get and subscribe.

```js
import { State } from '@symbiotic/green-state';

class CounterState extends State {
  constructor(initialCount = 0) {
    super({ count: initialCount });
  }

  increment = () => this.setState({ count: this.state.count + 1 })
  decrement = () => this.setState({ count: this.state.count - 1 })
}

const counter = new CounterState(10);
const unsubscribe = counter.subscribe(({ count }) => console.log(count)); // Immediately logs 10
counter.increment(); // Logs 11
counter.increment(); // Logs 12
counter.decrement(); // Logs 11

unsubscribe(); // Stop listening to state changes
```

## React Example

Green State provides react bindings that make it easy to subscribe to State and re-render your components using render props.

```js
import { Subscribe } from '@symbiotic/green-state';

const Counter = ({ initialCount }) => (
  <Subscribe to={() => new Counter(initialCount)}>
    {/* The state methods (increment, decrement) are automatically passed to the render function along with the state */}
    {({ count, increment, decrement }) => (
      <div>
        <button onClick={increment}>Add</button>
        Count: {count}
        <button onClick={decrement}>Subtract</button>
      </div>
    )}
  </Subscribe>
);

const App = () => (
  <div>
    {/* 2 separate counters */}
    <Counter initialCount={10} />
    <Counter initialCount={20} />
  </div>
);
```

Some important takeaways from this example:

- Subscribe's `to` prop takes a function that must return a state object (with subscribe and get methods).
- Any methods of the state object are merged with the state values and passed to the render function, so adding actions to mutate state is simply a matter of adding methods to your state object.
- Since the state interface is very similar to React's setState, its quite easy to start with react state and then refactor to a State class if it gets more complex.
- Because our State class is separate from react, its easy to re-use it across components.
- Unsubscribing to state when the component unmounts is automatically handled by the Subscribe component.

## Loading State Asynchronously

Often state is not entire local and must be loaded asynchronously before it can be used. For this reason, the Subscribe method supports returning a promise that resolves to a state object and your render function will not be called until the state is loaded.

```js
import { State } from '@symbiotic/green-state';

class BlogPostsState extends State {
  loadPosts = async () => {
    this.setState({ loading: true });

    const url = '...';
    const response = await fetch(url);
    const { posts } = await response.json();

    this.setState({ posts, loading: false });
  };
};

const loadBlogPosts = async () => {
  const blogPostsState = new BlogPostsState();
  await blogPostsState.loadPosts();
  return blogPostsState;
};

const App = () => {
  return (
    <Subscribe to={loadBlogPosts}>
      {({ posts, loading, loadPosts }) => (
        <div>
          {loading &&
            <p>Loading blog posts...</p>
          }
          {!loading &&
            <>
              <ul>
                {posts.map(post => (
                  <li key={post.postId}>{post.title}</li>
                ))}
              </ul>
              <button onClick={loadPosts}>Refresh List</button>
            </>
          }
        </div>
      )}
    </Subscribe>
  );
};
```

Key points from this example

- Subscribe's `to` prop can be a function that returns a promise so you can handle asynchronously loading state
- Subscribe will wait to call your render function until the state class calls setState (or initializes state in the constructor)

## State Classes and Components

We have found that many times we were re-writing the same state management pattern over and over. For example, toggling between 2 values (on/off, expanded/collapsed, mouseover/mouseon, etc.) or managing a string value (e.g. a form field). Green State provides a number of state classes out of the box that we think speed up development by reducing the need to rewrite the same code over and over. Green State also provides react components for each of these state classes to make it easy to use them with React.

### BooleanState

```js
import { BooleanState, Subscribe } from '@symbiotic/green-state';

const MyToggle = (initialValue = false) => {
  <Subscribe to={() => new BooleanState(initialValue)}>
    {({ isOn, on, off }) => {
      <button onClick={isOn ? off : on}>
        {isOn ? 'TURN IT OFF' : 'TURN IT ON'}
      </button>
    }}
  </Subscribe>
};
```

### ...and InjectToggle

For each of the simple states Green State provides like BooleanState, StringState we provide an Inject version that is a react component. This means you dont need to use Subscribe or the state class directly and you can pass any constructor arguments via props.
Comparing this to the previous example, we see that InjectToggle is just a simple adapter to make it more ergonomic to use Green State with react.

```js
import { InjectToggle } from '@symbiotic/green-state';

const MyToggleWithInject = (initialValue = false) => {
  <InjectToggle initialValue={initialValue}>
    {/* same as above */}
  </Subscribe>
};
```

### InjectHover and InjectFocus

Two of the most common use-cases for toggling are handling hover and handling focus. Green State provides InjectHover and InjectFocus components that make this more ergonomic just by aliasing the isOn/on/off props.

```js
import { InjectHover, InjectFocus } from '@symbiotic/green-state';

const MyButton = () => {
  <InjectHover>
    {({ isHovered, onMouseOver, onMouseOut }) => {
      <button onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
        {isHovered ? 'IM HOVERED' : 'IM NOT HOVERED'}
      </button>
    }}
  </InjectHover>
};

const MyField = () => {
  <InjectHover>
    {({ isFocused, onFocus, onBlur }) => {
      <>
        <input onFocus={onFocus} onBlur={onBlur} />
        {isFocused && <span>I am focused!</span>}
      </>
    }}
  </InjectHover>
};
```

### StringState and InjectString

StringState and InjectString are used for managing the value of a single string, for example in a form field.

```js
import { StringState, Subscribe, InjectString } from '@symbiotic/green-state';

const MyForm = (initialValue = 'Hello') => {
  <Subscribe to={() => new StringState(initialValue)}>
    {({ value, set, clear, reset }) => {
      <>
        <input
          type="text"
          value={value}
          onChange={e => set(e.target.value)}
        />
        <button onClick={clear}>Clear</button> {/* Set to '' */}
        <button onClick={reset}>Reset</button> {/* Set to initialValue */}
      </>
    }}
  </Subscribe>
};

// or use InjectString, same as above
const MyFormWithInject = (initialValue = 'Hello') => {
  <InjectString initialValue={initialValue}>
    {/* same as above */}
  </InjectString>
};
```

### ArrayState and InjectArray

ArrayState and InjectArray are used for managing a list of values.

```js
import { ArrayState, Subscribe, InjectArray } from '@symbiotic/green-state';

const MyGroceryList = (initialValues = ['Eggs', 'Milk']) => {
  <Subscribe to={() => new ArrayState(initialValues)}>
    {({ values, set, push, removeElement, clear, reset }) => (
      <>
        <ul>
          {values.map((value, index) => (
            <li key={index}>'
              {value}
              <button onClick={() => removeElement(value)}>X</button>
            </li>
          ))}
        </ul>
        <button onClick={() => push('Toilet Paper')}>Add Toilet Paper</button>
        <button onClick={() => push('Beer')}>Add Beer</button>
        <button onClick={() => set(['Peanut Butter', 'Jelly'])}>
          Use Saved List 1
        </button> {/* Overwrite with provided value */}
        <button onClick={clear}>Clear</button> {/* Set to [] */}
        <button onClick={reset}>Reset</button> {/* Set to initialValues */}
      </>
    )}
  </Subscribe>
};

// or use InjectArray, same as above
const MyGroceryListWithInject = (initialValue = ['Eggs', 'Milk']) => {
  <InjectArray initialValues={initialValues}>
    {/* same as above */}
  </InjectArray>
};
```

### Composite State

Green State encourages you to create small re-usable state classes that encapsulate a single responsibility. A side effect of this is that you often may want to subscribe to multiple states. For example, imagine a list with a field above it that allows you to add items. We have the field value as well as the list values. This is easy enough to achieve by nesting Subscribe components but it can get difficult to read the more subscribes you have. Green State provides a Compose component that allows you to compose react components such as InjectString together.

This works with any component that uses render props (where you pass a function as the child). So Green State's state components like InjectString can be composed with components that use render props such as formik, react power plug or react values.

```js
import { Compose, InjectString, InjectArray } from '@symbiotic/green-state';

const MyGroceryList = () => {
  <Compose components={[
    StringState,
    <ArrayState initialValues={['Eggs']} /> {/* Create the component if you need to supply props */}
  ]}>
    {(
      newItem, // The first state, StringState
      groceryList // The second state, ArrayState
    ) => (
      <>
        <form onSubmit={() => {
          groceryList.push(newItem.value);
          newItem.clear();
        }}>
          <label>Add an Item</label>
          <input
            type="text"
            value={newItem.value}
            onChange={e => newItem.set(e.target.value)}
          />
        </form>
        <ul>
          {groceryList.values.map((value, index) => (
            <li key={index}>'
              {value}
              <button onClick={() => groceryList.removeElement(value)}>X</button>
            </li>
          ))}
        </ul>
      </>
    )}
  </Subscribe>
};
```

### Composing Components

In the above example, we are composing State instances, but Green State also provides a Compose react component that allows you to compose react components such as InjectString together.

This technically works with any component that uses render props (where you pass a function as the child). So Green State's state components like InjectString can be composed with components that use render props such as formik, react power plug or react values.

```js
import { Compose, InjectString, InjectArray } from '@symbiotic/green-state';

const MyGroceryList = () => {
  <Compose components={[
    StringState,
    <ArrayState initialValues={['Eggs']} /> {/* Create the component if you need to supply props */}
  ]}>
    {/* Same as previous example */}
  </Compose>
```

An important caveat here is that composing states in this way means that the entire subscription will re-render every time ANY of the states change. This can cause performance issues if one of the subscriptions changes much more frequently than others or the render is expensive. This can be solved in a variety of ways (use separate subscriptions so you only re-render the relevant part of the tree, use pure components, etc. but this is a general react issue that is not unique to Green State and is outside the scope of this documentation).

## Dependency Injection & Inversion of Control

### Sharing State

### Inject

### DependencyContainerContext

### Child Containers

### InjectAndSubscribe

## Key Concepts

State
  State
  ArrayState
  BooleanState
  StringState
  CompositeState
  Subscribe
DI/IoC
  Container
React Bindings
  Inject
  DependencyContainerContext
  InjectAndSubscribe
  withDependencies HOC
  Compose

## Roadmap

- [ ] TOC
- [ ] Public website + docs
- [ ] Don't pass setState: undefined, get: undefined to subscribers
- [ ] Better test coverage + badge
- [ ] Node.js support for IOC portion
- [ ] Browser support information
- [ ] CI build pipeline
- [ ] TypeScript declarations
- [ ] Better TypeScript DX (reduced use of any, etc.)
- [ ] Additional bindings (angular, vue, etc.)
- [ ] Support for using a different DI/IoC framework or container implementation (inversify)
- [ ] Pre-compiled UMD package with window.GreenState global variable usable via script tag
- [ ] Decorator for injecting dependencies as props (currently only supports HOC)
- [ ] FAQ
- [ ] Contributing guide
- [ ] Consider splitting into separate packages (state, react-state, ioc, react-ioc)
- [ ] Class annotations for singletones, transient, etc.
- [ ] Class annotations for child container only (without opting in, having a State class resolve in the root container when there are child containers can be a harmful default because it can lead to unintentionally sharing generic state classes across unrelated views)
- [ ] Document how to test state classes
- [ ] API Reference
- [ ] Troubleshooting / Gotchas
- [ ] DX Experience (debugging container, seeing all services)
- [ ] Feedback
- [ ] Recipes
- [ ] Basic Tutorial
- [ ] Advanced Tutorial
- [ ] Prior Art
- [ ] Logo
