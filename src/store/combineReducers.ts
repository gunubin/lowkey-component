import {Action, Reducer, ReducersMapObject} from './types'

export const combineReducers = <State extends Record<string, unknown>>(
  reducers: ReducersMapObject<State>
): Reducer<State, Action> => {
  return (state: State | undefined, action: Action): State => {
    const nextState: Partial<State> = {}
    Object.entries(reducers).forEach(([key, reducer]) => {
      const prevState = state && state[key]
      nextState[key as keyof State] = reducer(prevState, action)
    })
    return nextState as State
  }
}
