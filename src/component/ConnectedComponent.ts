import {Refs} from './types'
import {StoreProvider} from '../store'
import {Component} from './Component'
import {Selector} from '../store/createSelector'
import {Unsubscribe} from '../store/types'
import {observeStore} from '../store/utils'

/**
 * storeのsubscribeのunsubscribeし忘れないようにするためだけのクラス
 */
export class ConnectedComponent<THTMLElement extends HTMLElement = HTMLElement, TRefs extends Refs = Refs
> extends Component<THTMLElement, TRefs> {
  private unsubscribes: Map<Selector, Unsubscribe> = new Map()
  private store = StoreProvider.create()

  observe<TState, TReturn>(
    selector: Selector<TState, TReturn>,
    onChange: (val: TReturn) => void,
  ): TReturn {
    const state = this.store.getState()
    const initialValue = selector(state)
    this.unsubscribes.set(
      selector,
      observeStore(selector, this.store, initialValue, onChange),
    )
    return initialValue
  }

  willUnmount() {
    this.unsubscribes.forEach((unsubscribe) => unsubscribe())
  }
}

// FIXME: decorateした側のClassで型解決できないので不可能
// https://github.com/microsoft/TypeScript/issues/4881
//  https://stackoverflow.com/questions/36512151/typescript-class-decorators-add-class-method
// export function connect<T extends {new (...args: any[]): {}}>(constructor: T) {
//   return class extends constructor {
//     private unsubscribes: Map<Selector, Unsubscribe> = new Map();
//
//     observe<TSelector extends Selector>(
//       selector: TSelector,
//       onChange: (val: ReturnType<TSelector>) => void,
//     ) {
//       this.unsubscribes.set(selector, observeStore(selector, onChange));
//     }
//
//     willUnmount() {
//       this.unsubscribes.forEach((unsubscribe) => unsubscribe());
//     }
//   };
// }

// (<any>project).test() 型キャストでできるけど type safeじゃない
// これは型キャスト用 (this as any as IConnectedComponent).observe()
// export interface IConnectedComponent {
//   observe: <TSelector extends Selector>(
//     selector: TSelector,
//     onChange: (val: ReturnType<TSelector>) => void,
//   ) => void;
// }
