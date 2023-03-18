import { Signal } from 'typed-signals';

import { AnyAction, Reducer, Unsubscribe } from './types';

export const dispatcher = new Signal();

export function createStore<TState>(reducer: Reducer<TState>) {
  let store: TState;

  const dispatch = (action: AnyAction): TState => {
    store = reducer(store, action);
    dispatcher.emit(action);
    return store;
  };

  const subscribe = (listener: () => void): Unsubscribe => {
    const ret = dispatcher.connect(listener);
    return ret.enabled ? () => ret.disconnect() : () => {
      /* empty function */
    };
  };

  return {
    dispatch,
    getState: () => store,
    subscribe,
  };
}
