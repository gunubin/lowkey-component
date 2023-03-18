import {AnyAction, Unsubscribe} from './types'


type StoreContext<State> = {
  getState: () => State;
  dispatch: (action: AnyAction) => void;
  subscribe: (listener: () => void) => Unsubscribe;
}

/**
 * reduxでjsの容量大きくならないように超雑に作ったstate管理マン
 * memo化もクソもないしパフォーマンス不安だけどｱｶﾝかったらredux使う
 */
export class StoreProvider<State = any> {
  private context: StoreContext<State> | null = null;
  static singleton: StoreProvider

  static create() {
    if (StoreProvider.singleton) {
      return StoreProvider.singleton
    }
    return (StoreProvider.singleton = new StoreProvider())
  }

  setContext(context: StoreContext<State>) {
    this.context = context;
  }

  private getContext() {
    if (!this.context) {
      throw Error('Store context does not exists');
    }
    return this.context
  }

  dispatch(action: AnyAction) {
    return this.getContext().dispatch(action)
  }

  getState() {
    return this.getContext().getState()
  }

  subscribe(listener: () => void): Unsubscribe {
    return this.getContext().subscribe(listener)
  }
}
