// Unsubscribe: storeの購読を解除するための関数型
export type Unsubscribe = () => void;

// Subscribe: storeの状態変更を購読する関数型
export type Subscribe = (listener: () => void) => Unsubscribe;

// Action: Reduxアクションの基本インターフェース
export interface Action<T = any> {
  type: T;
}

// Actions: Reduxアクションのレコード型
export type Actions<T extends keyof any = string> = Record<T, Action>;

// AnyAction: 任意の追加プロパティを持つActionインターフェース
export interface AnyAction extends Action {
  [extraProps: string]: any;
}

// PayloadAction: ペイロードを持つActionの型
export type PayloadAction<TPayload = any, TType extends string = string> = Action<TType> & {
  payload: TPayload;
};

// Reducer: Reduxリデューサー関数の型
export type Reducer<TState = any, TAction extends Action = AnyAction> = (
  state: TState | undefined,
  action: TAction
) => TState;

// SliceReducers: スライスリデューサーのレコード型
export type SliceReducers<State> = {
  [K: string]: Reducer<State, PayloadAction<any>>;
};

// PayloadActionCreator: ペイロード付きアクションクリエーターの型
type PayloadActionCreator<P> = (p: P) => PayloadAction<P>;

// ActionCreatorWithoutPayload: ペイロードなしアクションクリエーターの型
type ActionCreatorWithoutPayload = () => AnyAction;

// ActionCreatorForCaseReducer: ケースリデューサーに対応するアクションクリエーターの型
type ActionCreatorForCaseReducer<CR> = CR extends (
                                            state: any,
                                            action: infer Action
                                          ) => any
                                       ? Action extends PayloadAction<infer P>
                                         ? PayloadActionCreator<P>
                                         : ActionCreatorWithoutPayload
                                       : ActionCreatorWithoutPayload;

// CaseReducerActions: ケースリデューサーに対応するアクションクリエーターのレコード型
export type CaseReducerActions<CaseReducers extends SliceReducers<any>> = {
  [Type in keyof CaseReducers]: ActionCreatorForCaseReducer<CaseReducers[Type]>;
};

// ReducersMapObject: リデューサーのマップオブジェクト型
export type ReducersMapObject<S = any, A extends Action = Action> = {
  [K in keyof S]: Reducer<S[K], A>;
};
