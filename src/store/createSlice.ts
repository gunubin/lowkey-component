import {Action, AnyAction, CaseReducerActions, PayloadAction, Reducer} from './types'

export type CaseReducer<TState, TAction extends Action = AnyAction> = (
  state: TState,
  action: TAction
) => TState | void;

export type SliceCaseReducers<State> = {
  [K: string]: CaseReducer<State, PayloadAction<any>>
}

export function createSlice<State, CR extends SliceCaseReducers<State>>({
  initialValues,
  reducers
}: {initialValues: State; reducers: CR}) {

  const actions = Object.keys(reducers).reduce((acc, key) => {
    return {...acc, [key]: (payload: any) => ({payload, type: key})}
  }, {})

  const reducer = (state: State = initialValues, action: PayloadAction) => {
    const reducer = reducers[action.type]
    // TODO: reducerによってstateが変更されreturnしている（オブジェクト参照が気になり）
    reducer?.(state, action)
    return state
  }

  return {
    actions,
    getInitialValues: () => initialValues,
    reducer,
  } as {actions: CaseReducerActions<CR>, reducer: Reducer<State>, getInitialValues: () => State} /* TODO: types */
}
