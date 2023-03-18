import { StoreProvider } from './StoreProvider';
import { Selector } from './createSelector';
/**
 * 簡単なメモ化機能付き
 */
export declare const observeStore: <TState, TSelector extends Selector>(selector: TSelector, store: StoreProvider<TState>, initialState: ReturnType<TSelector>, onChange: (val: ReturnType<TSelector>) => void, options?: {
    equalityFn?: (() => void) | undefined;
} | undefined) => import("./types").Unsubscribe;
