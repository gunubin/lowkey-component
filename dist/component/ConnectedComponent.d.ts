import { Refs } from './types';
import { Component } from './Component';
import { Selector } from '../store/createSelector';
/**
 * storeのsubscribeのunsubscribeし忘れないようにするためだけのクラス
 */
export declare class ConnectedComponent<THTMLElement extends HTMLElement = HTMLElement, TRefs extends Refs = Refs> extends Component<THTMLElement, TRefs> {
    private unsubscribes;
    private store;
    observe<TState, TReturn>(selector: Selector<TState, TReturn>, onChange: (val: TReturn) => void): TReturn;
    willUnmount(): void;
}
