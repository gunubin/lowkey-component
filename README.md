# Component Class

The Component class is an abstracted class for manipulating HTML elements. It simplifies operations
on HTML elements such as adding, removing, and dispatching event listeners, retrieving child element
references, and mounting and unmounting.

# Usage

Import the Component class.

```typescript
import {Component} from 'your-package-name';
```

Create a custom class that extends the Component class.

```typescript
class MyComponent extends Component {
  constructor(element) {
    super(element);
  }

  didMount() {
// Process when the component is mounted
  }

  willUnmount() {
// Process before the component is unmounted
  }

  didUnmount() {
// Process when the component is unmounted
  }
}
```

Use the custom component.

```typescript
const element = document.getElementById('my-element');
const myComponent = new MyComponent(element);
myComponent.mount();
```
