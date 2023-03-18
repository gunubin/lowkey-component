import { Signal } from 'typed-signals';
import { AnyAction, Reducer, Unsubscribe } from './types';
export declare const dispatcher: Signal<(...args: any[]) => any>;
export declare function createStore<TState>(reducer: Reducer<TState>): {
    dispatch: (action: AnyAction) => TState;
    getState: () => TState;
    subscribe: (listener: () => void) => Unsubscribe;
};
