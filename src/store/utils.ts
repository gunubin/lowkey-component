import {equal as shallowEqual} from 'fast-shallow-equal'

import {StoreProvider} from './StoreProvider'
import {Selector} from './createSelector'

/**
 * 簡単なメモ化機能付き
 */
export const observeStore = <TState, TSelector extends Selector>(
  selector: TSelector,
  store: StoreProvider<TState>,
  initialState: ReturnType<TSelector>,
  onChange: (val: ReturnType<TSelector>) => void,
  options?: {
    equalityFn?: () => void;
  },
) => {
  const {equalityFn = shallowEqual} = options || {};
  let currentState = initialState;

  function handleChange() {
    const nextState = selector(store.getState()) as ReturnType<TSelector>;
    const isSameState = equalityFn(nextState, currentState);
    if (!isSameState) {
      currentState = nextState;
      onChange(currentState);
    }
  }

  const unsubscribe = store.subscribe(handleChange);
  handleChange();
  return unsubscribe;
};
