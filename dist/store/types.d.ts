export type Unsubscribe = () => void;
export type Subscribe = (listener: () => void) => Unsubscribe;
export interface Action<T = any> {
    type: T;
}
export type Actions<T extends keyof any = string> = Record<T, Action>;
export interface AnyAction extends Action {
    [extraProps: string]: any;
}
export type PayloadAction<TPayload = any, TType extends string = string> = Action<TType> & {
    payload: TPayload;
};
export type Reducer<TState = any, TAction extends Action = AnyAction> = (state: TState | undefined, action: TAction) => TState;
export type SliceReducers<State> = {
    [K: string]: Reducer<State, PayloadAction<any>>;
};
type PayloadActionCreator<P> = (p: P) => PayloadAction<P>;
type ActionCreatorWithoutPayload = () => AnyAction;
type ActionCreatorForCaseReducer<CR> = CR extends (state: any, action: infer Action) => any ? Action extends PayloadAction<infer P> ? PayloadActionCreator<P> : ActionCreatorWithoutPayload : ActionCreatorWithoutPayload;
export type CaseReducerActions<CaseReducers extends SliceReducers<any>> = {
    [Type in keyof CaseReducers]: ActionCreatorForCaseReducer<CaseReducers[Type]>;
};
export type ReducersMapObject<S = any, A extends Action = Action> = {
    [K in keyof S]: Reducer<S[K], A>;
};
export {};
