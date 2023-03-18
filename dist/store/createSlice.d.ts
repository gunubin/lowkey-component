import { Action, AnyAction, CaseReducerActions, PayloadAction, Reducer } from './types';
export type CaseReducer<TState, TAction extends Action = AnyAction> = (state: TState, action: TAction) => TState | void;
export type SliceCaseReducers<State> = {
    [K: string]: CaseReducer<State, PayloadAction<any>>;
};
export declare function createSlice<State, CR extends SliceCaseReducers<State>>({ initialValues, reducers }: {
    initialValues: State;
    reducers: CR;
}): {
    actions: CaseReducerActions<CR>;
    reducer: Reducer<State>;
    getInitialValues: () => State;
};
