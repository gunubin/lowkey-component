import { AnyAction, Unsubscribe } from './types';
type StoreContext<State> = {
    getState: () => State;
    dispatch: (action: AnyAction) => void;
    subscribe: (listener: () => void) => Unsubscribe;
};
/**
 * reduxでjsの容量大きくならないように超雑に作ったstate管理マン
 * memo化もクソもないしパフォーマンス不安だけどｱｶﾝかったらredux使う
 */
export declare class StoreProvider<State = any> {
    private context;
    static singleton: StoreProvider;
    static create(): StoreProvider<any>;
    setContext(context: StoreContext<State>): void;
    private getContext;
    dispatch(action: AnyAction): void;
    getState(): State;
    subscribe(listener: () => void): Unsubscribe;
}
export {};
