# Green State

Green State is a composable state management library for Javascript Apps with first-class support of DI/IoC. It helps you write complex applications that can evolve in a sustainable way as requirements change by encapsulating state so it is easy to reason about what parts of the system would be impacted by a given change. It also encourages composition by providing a set of small re-usable units that can be combined in a variety of different ways.

You can use Green State together with React using the provided bindings or you could easily writer a few small adapters to use it with any other view library.

## Table of Contents

* [Installation](#installation)
* [Basic Example](#basic-example)
* [React Example](#react-example)
* [Loading State Asynchronously](#loading-state-asynchronously)
* [State Classes and Components](#state-classes-and-components)
    * [BooleanState](#booleanstate)
    * [InjectToggle React Helper](#injecttoggle-react-helper)
    * [InjectHover and InjectFocus](#injecthover-and-injectfocus)
    * [StringState and InjectString](#stringstate-and-injectstring)
    * [ArrayState and InjectArray](#arraystate-and-injectarray)
    * [Composite State](#composite-state)
* [Dependency Injection and Inversion of Control](#dependency-injection-and-inversion-of-control)
    * [Getting Started with IOC in React](#getting-started-with-ioc-in-react)
    * [Inject Dependencies into Components](#inject-dependencies-into-components)
    * [Getting Multiple Dependencies](#getting-multiple-dependencies)
    * [Getting Dependencies as Props](#getting-dependencies-as-props)
    * [Sharing State using IOC](#sharing-state-using-ioc)
    * [Hierarchical IOC with Child Containers](#hierarchical-ioc-with-child-containers)
        * [Use Cases for Child Containers](#use-cases-for-child-containers)
    * [Hierarchical IOC in React](#hierarchical-ioc-in-react)
* [Roadmap](#roadmap)

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
  setState(objectToMergeWithExistingState) {},

  // Get the current state
  get() {},

  // Subscribe to state changes, callback will be called every time state changes
  subscribe(callback) {},
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
  <Subscribe to={() => new CounterState(initialCount)}>
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

const MyToggle = (initialValue = false) => (
  <Subscribe to={() => new BooleanState(initialValue)}>
    {({ isOn, on, off }) => (
      <button onClick={isOn ? off : on}>
        {isOn ? 'TURN IT OFF' : 'TURN IT ON'}
      </button>
    )}
  </Subscribe>
);
```

### InjectToggle React Helper

For each of the simple states Green State provides like BooleanState, StringState we provide an Inject version that is a react component. This means you dont need to use Subscribe or the state class directly and you can pass any constructor arguments via props.
Comparing this to the previous example, we see that InjectToggle is just a simple adapter to make it more ergonomic to use Green State with react.

```js
import { InjectToggle } from '@symbiotic/green-state';

const MyToggleWithInject = (initialValue = false) => (
  <InjectToggle initialValue={initialValue}>
    {/* same as above */}
  </InjectToggle>
);
```

### InjectHover and InjectFocus

Two of the most common use-cases for toggling are handling hover and handling focus. Green State provides InjectHover and InjectFocus components that make this more ergonomic just by aliasing the isOn/on/off props.

```js
import { InjectHover, InjectFocus } from '@symbiotic/green-state';

const MyButton = () => (
  <InjectHover>
    {({ isHovered, onMouseOver, onMouseOut }) => (
      <button onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
        {isHovered ? 'IM HOVERED' : 'IM NOT HOVERED'}
      </button>
    )}
  </InjectHover>
);

const MyField = () => (
  <InjectFocus>
    {({ isFocused, onFocus, onBlur }) => (
      <>
        <input onFocus={onFocus} onBlur={onBlur} />
        {isFocused && <span>I am focused!</span>}
      </>
    )}
  </InjectFocus>
);
```

### StringState and InjectString

StringState and InjectString are used for managing the value of a single string, for example in a form field.

```js
import { StringState, Subscribe, InjectString } from '@symbiotic/green-state';

const MyForm = ({ initialValue = 'Hello' }) => (
  <Subscribe to={() => new StringState(initialValue)}>
    {({ value, set, clear, reset }) => (
      <>
        <input
          type="text"
          value={value}
          onChange={e => set(e.target.value)}
        />
        <button onClick={clear}>Clear</button> {/* Set to '' */}
        <button onClick={reset}>Reset</button> {/* Set to initialValue */}
      </>
    )}
  </Subscribe>
);

// or use InjectString, same as above
const MyFormWithInject = ({ initialValue = 'Hello' }) => (
  <InjectString initialValue={initialValue}>
    {/* same as above */}
  </InjectString>
);
```

### ArrayState and InjectArray

ArrayState and InjectArray are used for managing a list of values.

```js
import { ArrayState, Subscribe, InjectArray } from '@symbiotic/green-state';

const MyGroceryList = ({ initialValues = ['Eggs', 'Milk'] }) => (
  <Subscribe to={() => new ArrayState(initialValues)}>
    {({ values, set, push, removeElement, clear, reset }) => (
      <>
        <ul>
          {values.map((value, index) => (
            <li key={index}>
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
);

// or use InjectArray, same as above
const MyGroceryListWithInject = ({ initialValues = ['Eggs', 'Milk'] }) => (
  <InjectArray initialValues={initialValues}>
    {/* same as above */}
  </InjectArray>
);
```

### Composite State

Green State encourages you to create small re-usable state classes that encapsulate a single responsibility. A side effect of this is that you often may want to subscribe to multiple states. For example, imagine a list with a field above it that allows you to add items. We have the field value as well as the list values. This is easy enough to achieve by nesting Subscribe components but it can get difficult to read the more subscribes you have. Green State provides a Compose component that allows you to compose react components such as InjectString together.

This works with any component that uses render props (where you pass a function as the child). So Green State's state components like InjectString can be composed with components that use render props such as formik, react power plug or react values.

```js
import { Compose, InjectString, InjectArray } from '@symbiotic/green-state';

const MyGroceryList = () => (
  <Compose components={[
    InjectString,
    <InjectArray initialValues={['Eggs']} /> /* Create the component if you need to supply props */
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
  </Compose>
);
```

An important caveat here is that composing states/components in this way means that the entire subscription will re-render every time ANY of the states change. This can cause performance issues if one of the subscriptions changes much more frequently than others or the render is expensive. This can be solved in a variety of ways (use separate subscriptions so you only re-render the relevant part of the tree, use pure components, etc. but this is a general react issue that is not unique to Green State and is outside the scope of this documentation).

## Dependency Injection and Inversion of Control

As we decompose our application into small units that have a single responsibility, we end up needing to recombine these units to build up complex functionality. This pattern is prevalent in unix (composing shell commands with pipe) and is an incredibly powerful strategy for building complex applications that are easy to reason about and support refactoring as needed (as you can swap out an implementation when new behavior is desired without having to touch a lot of code). In order to easily swap out implementations, it's important that dependencies are injected into the classes that need them so that ClassA does not need to know how to create ClassB or any of its dependencies in order to use it. A trade off is that as your application grows, so does your dependency graph, such that getting an instance of ClassA may require resolving ClassB which needs ClassC, etc, etc. Manually managing dependencies is not a sustainable approach as it requires a lot of "glue code" and whenever your dependency graph changes you have to manually update the glue code to use the right dependencies. This is where DI containers come in handy. All of the knowledge of how to construct classes and their dependencies is pulled up into the container. In this way, control of how to instantiate classes is "inverted" from the within a class constructor to the container outside of the class. This is the heart of IoC. We gain a powerful tool for controlling how our classes and their dependencies are instantiated, and we can easily change that without touching the classes themselves. Here is a simple example.

```js
import { Container } from '@symbiotic/green-state';

class APIClientConfig {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }
}

class APIClient {
  // The static inject array tells the container what services to instantiate and "inject" into the constructor
  // I need an instance of APIClientConfig as my first argument
  static inject = [APIClientConfig]

  constructor(config) {
    this.config = config;
  }

  getBlogPosts = () => {
    const { posts } = fetch(`${this.config.baseURL}`)
      .then(response => response.json());

    return posts;
  }

}

const container = new Container();

// Let the container know to use this instance for config whenever its needed
// This might actually need to come from an API call itself or an environment variable at build time or it may need to be different depending on the logged in user
// But consumers of APIClientConfig don't need to know that
container.registerInstance(APIClientConfig, new APIClientConfig('http://api.symbioticlabs.io/v1'));

// The container automatically injects APIClient with the right config
// You can imagine this is most useful when the line of code below is very far away from the registerInstance call above
const apiClient = container.get(APIClient);
```

### Getting Started with IOC in React

In order to use Green State's IOC features, you need to create a top-level `<DependencyContainerContext>` and wrap it around your app. Let's imagine you want to make a User object available anywhere in your application.

```js
import { Inject, DependencyContainerContext } from '@symbiotic/green-state';

class User {
  constructor({ userId, username }) {
    this.userId = userId;
    this.username = username;
  }
}

class AppDependencyContainerContext extends DependencyContainerContext {
  // Sub classes of DependencyContainerContext must implement containerMounted
  async containerMounted(container) {
    // Imagine we loaded the user from the server, or local storage
    const currentUser = new User({ userId: 5, username: 'trevor' });

    // You can use the container passed into containerMounted to add dependencies to the container
    // Note that you only need to manually register instances like this if the container cannot automatically resolve the dependency (by new'ing it up)
    container.registerInstance(User, currentUser);
  }
}

class App extends React.Component {
  render() {
    return (
      <AppDependencyContainerContext>
        <Inject diKey={User}>
          {user => <p>Hello {user.username}</p>}
        </Inject>
      </AppDependencyContainerContext>
    );
  }
}
```

Now that we have provided a top-level container context, any component anywhere in our application will be able to get at anything in the container, as we'll see in the next example.

### Inject Dependencies into Components

In order to get an instance from the container in a component, you can use the `<Inject>` react component. For example, lets imagine we have want to show the user profile in the header.

```js
import { Inject } from '@symbiotic/green-state';

class UserProfile extends React.Component {
  render() {
    return (
      <Inject diKey={User}>
        {user => <p>{user.username}</p>}
      </Inject>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <AppDependencyContainerContext>
        <div className="header">
          <UserProfile />
        </div>
      </AppDependencyContainerContext>
    );
  }
}
```

Using the `diKey` prop, we ask for the User key, and our render function receives the user instance from the container as its first argument.

### Getting Multiple Dependencies

You can pass an array of keys to Inject with the `diKeys` props, and each key will be pulled from the container and passed as an argument to the render function.

```js
import { Inject } from '@symbiotic/green-state';

class Theme {
  primaryColor = 'red'
  secondaryColor = 'black'
}

class UserProfile extends React.Component {
  render() {
    return (
      <Inject diKeys={[User, Theme]}>
        {(user, theme) => (
          <p style={{ color: theme.primaryColor }}>{user.username}</p>
        )}
      </Inject>
    );
  }
}
```

### Getting Dependencies as Props

Green State also provides a `withDependencies` Higher Order Component (HOC) which you can use to inject dependencies as props. This is especially useful if you need to use the dependencies in a class lifecycle method.

```js
import { withDependencies } from '@symbiotic/green-state';

class UserProfile extends React.Component {
  render() {
    const { theme, user } = this.props;

    return (
      <p style={{ color: theme.primaryColor }}>{user.username}</p>
    );
  }
}

UserProfile = withDependencies({
  // The key is the propName and the value is the dependency key
  theme: Theme,
  user: User
})(UserProfile);
```

### Sharing State using IOC

It is common you may need to share access to a piece of state across components. For example, imagine you have a toast notification in your app and you want any component to be able to able to show a message.
By putting the state into the container, it is easy to access it in any component with `<Inject>` or the `withDependencies` HOC.


```js
import { Inject, Subscribe, State, withDependencies } from '@symbiotic/green-state';

class GlobalNotificationState extends State {
  setMessage = ({ message, type = 'info' }) => this.setState({ message, type });
}

const AppNotificationBar = () => (
  <Inject diKey={GlobalNotificationState}>
    {notificationsState => (
      <Subscribe to={() => notificationsState}>
        {({ message, type }) => (
          <div className={`alert-${type}`}>{message}</div>
        )}
      </Subscribe>
    )}
  </Inject>
);

let ShowMessageButton = ({ notifications }) => {
  <button onClick={() => notifications.setMessage({ message: 'Hello!' })}>
    Say Hello
  </button>
};
ShowMessageButton = withDependencies({ notifications: GlobalNotificationState })(ShowMessageButton);

const App = () => (
    <AppDependencyContainerContext>
      <AppNotificationBar />
      <ShowMessageButton />
    </AppDependencyContainerContext>
);
```

Note that these components are able to share state without having to know about each other. `AppNotificationBar` in the above example is a bit verbose as it needs to use `<Inject>` to get the state object and then `<Subscribe>` to subscribe to changes. Green State provides an `<InjectAndSubscribe>` helper that makes this common paradigm more terse.

```js
import { InjectAndSubscribe } from '@symbiotic/green-state';

const AppNotificationBar = () => (
  <InjectAndSubscribe diKey={GlobalNotificationState}>
    {({ message, type }) => (
      <div className={`alert-${type}`}>{message}</div>
    )}
  </InjectAndSubscribe>
);
```

### Hierarchical IOC with Child Containers

So far we have looked at creating a single DI container from which we can retrieve dependencies. Green State supports creating child containers which inherit any of the dependencies from their parent container, but can also have their own services in them or override the parent services. Here is a basic example:

```js
import { Container } from '@symbiotic/green-state';

const container = new Container();
container.registerInstance(User, new User({ userId: 5, username: 'trevissimo' }));

const childContainer = container.createChild();
childContainer.registerInstance(Theme, { primaryColor: 'green', secondaryColor: 'black' });

const user = childContainer.get(User);
console.log(user.username); // 'trevissimo' from the parent container

const theme = childContainer.get(Theme);
console.log(theme.primaryColor); // 'green' from the child container
```

#### Use Cases for Child Containers:

- Encapsulation: Often some services are only used by parts of your application and creating a child container to hold these related services keeps them scoped to that part of your application instead of being globally available in the root container.
- Garbage collection: If all of your services are in the root container then they are all global and will not be garbage collected even if the parts of your application are no longer being displayed.
- Overrides: Part of your application may want to override a specific service that is available in the root container with a different implementation. For example, perhaps part of your application wants to override/extend the theme service to include specific settings that are only relevant to it.

### Hierarchical IOC in React

We used the `<DependencyContainerContext>` component earlier in order to make our user instance available to the container. You must have at least one component that extends `<DependencyContainerContext>`
at the top of your application in order to use any of Green State's ioc features such as `<Inject>`, `<InjectAndSubscribe>` and `withDependencies`. But you can also nest container contexts in your application in order to leverage Hierarchical IOC.

```js
import { DependencyContainerContext } from '@symbiotic/green-state';

class AppDependencyContainerContext extends DependencyContainerContext {
  async containerMounted(container) {
    // Parent container registers the user
    container.registerInstance(User, new User({ userId: 5, username: 'trevissimo' }));
  }
}

class ChildDependencyContainerContext extends DependencyContainerContext {
  async containerMounted(container) {
    // A child container provides an overridden theme
    container.registerInstance(Theme, { primaryColor: 'green', secondaryColor: 'black' });
  }
}

class App extends React.Component {
  render() {
    return (
      <AppDependencyContainerContext>
        {/* much deeper in the component hierarchy */}
        <ChildDependencyContainerContext>
          <Inject diKeys={[User, Theme]}>
            {(user, theme) => (
              /* primaryColor is 'green' from the child container */
              /* user.username is 'trevissimo' from the parent container */
              <p style={{ color: theme.primaryColor }}>{user.username}</p>
            )}
          </Inject>
        </ChildDependencyContainerContext>
      </AppDependencyContainerContext>
    );
  }
}
```

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
- [ ] Class annotations for singletons, transient, etc.
- [ ] Class annotations for child container only (without opting in, having a State class resolve in the root container when there are child containers can be a harmful default because it can lead to unintentionally sharing generic state classes across unrelated views)
- [ ] Document how to test state classes
- [ ] API Reference
- [ ] Troubleshooting / Gotchas
      - Accidental singletons in the root container shared across unrelated views (particularly problematic with state)
      - DI hierarchy resolution, autoRegister, our custom container resolution strategy
      - Using key to force remount of Subscribe or prevent incorrect component re-use
- [ ] DX Experience (debugging container, seeing all services)
- [ ] Feedback
- [ ] Recipes
- [ ] Basic Tutorial
- [ ] Advanced Tutorial
- [ ] Prior Art
- [ ] Logo
- [ ] Plugins? Make it extensible?
- [ ] Audit and improve bundle size
- [ ] UMD on CDN
- [ ] Multiple build targets (es6, commonjs, umd)
- [ ] License
- [ ] Core Concepts (State, IOC Container)
- [ ] Motivation / 3 Principles (Composition, Encapsulation, Inversion of Control)
- [ ] Naming conventions (Inject*, *Context)
- [ ] Design Decisions
