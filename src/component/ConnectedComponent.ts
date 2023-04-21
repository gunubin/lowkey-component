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

  didUnmount() {
    this.unsubscribes.forEach((unsubscribe) => unsubscribe())
  }
}
