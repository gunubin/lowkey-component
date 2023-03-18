export type Selector<TState = any, TReturn = any> = (state: TState) => TReturn;
export type SelectorReturn<TSelected, TResult> = (selected: TSelected) => TResult;

export const createSelector = <TState, TSelected, TResult>(
  selector: Selector<TState, TSelected>,
  selectReturn: SelectorReturn<TSelected, TResult>,
) => {
  return (state: TState): TResult => {
    const val = selector(state)
    return selectReturn(val)
  }
}
