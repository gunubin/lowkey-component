# Component Class

The Component class is an abstracted class for manipulating HTML elements. It simplifies operations
on HTML elements such as adding, removing, and dispatching event listeners, retrieving child element
references, and mounting and unmounting.

# Usage

Import the Component class.

```typescript
import {Component} from 'lowkey-component';
```

Create a custom class that extends the Component class.

```typescript
class MyComponent extends Component {

  didMount() {
// Process when the component is mounted
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

Create store related to the application using createSlice.

```typescript
import {createSelector} from 'lowkey-component'
import {createSlice} from 'lowkey-component'
import type {PayloadAction} from 'lowkey-component'
import {RootState} from './rootReducer'

export interface AppSlice {
  isOpenGlobalNav: boolean;
}

const initialValues: AppSlice = {
  isOpenGlobalNav: false,
}

export const selectAppState = (state: RootState) => {
  return state.app
}

const selectIsOpenGlobalNav = createSelector(
  selectAppState,
  ({isOpenGlobalNav}) => isOpenGlobalNav,
)

const appSlice = createSlice({
  initialValues,
  reducers: {
    isOpenGlobalNavSaved: (state, action: PayloadAction<boolean>) => {
      state.isOpenGlobalNav = action.payload
    },
  }
})


export const appSelectors = {
  selectIsOpenGlobalNav,
}

export const {
  isOpenGlobalNavSaved,
} = appSlice.actions

export const {getInitialValues} = appSlice
export default appSlice.reducer
```

Merge the store using combineReducers.

```typescript
import {combineReducers} from 'lowkey-component'
import appReducer from './appSlice'

export const rootReducer = combineReducers({
  app: appReducer,
})

export type RootState = ReturnType<typeof rootReducer>;
```

Initialize the StoreProvider.

```typescript
import {createSlice} from 'lowkey-component'
import {StoreProvider} from 'lowkey-component'

const {getState, dispatch, subscribe} = createStore(rootReducer)

const storeProvider = StoreProvider.create()
storeProvider.setContext({dispatch, getState, subscribe})
```

Dispatch actions using StoreProvider.

```typescript
import {isOpenGlobalNavSaved} from './appSlice'

class MyComponent extends Component {
  
  store = StoreProvider.create()
  
  didMount() {
    this.element.on('click', () =>> {
      store.dispatch(isOpenGlobalNavSaved(isOpen))
    })
  }
}
```

Create a custom class that extends the ConnectedComponent class.

```typescript
class MyConnectedComponent extends ConnectedComponent {

  didMount() {
    this.observe(appSelectors.selectIsOpenGlobalNav, (isOpen) => {
      isOpen
      ? this.open()
      : this.close()
    })
  }

  open() {
    // open menu
  }

  close() {
    // close menu
  }
  
}
```


## Integration barba.js
```typescript
class Heading extends Component {
  didMount() {
    console.log('Heading didMount');
  }
  didUnmount() {
    console.log('Heading didUnmount');
  }
};

const generator = new ComponentGenerator({
  '.js-heading': Heading,
});

generator.initialize();

barba.init({
    transitions: [
      {
        beforeEnter: async ({next}) => {
          generator.refresh(next.container);
          generator.mount(next.container);
        },
        after: async ({current}) => {
          generator.unmount(current.container);
        }
      }
    ]
});

```
