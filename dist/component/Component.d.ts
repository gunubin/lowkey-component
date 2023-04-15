import { Refs } from './types';
/**
 * Component Class
 */
export declare class Component<THTMLElement extends HTMLElement = HTMLElement, TRefs extends Refs = Refs> {
    element: THTMLElement;
    private handlers;
    private selected;
    protected _isMounted: boolean;
    protected refs: TRefs;
    constructor(element: THTMLElement);
    mount(): void;
    private selectRefs;
    select<E extends HTMLElement = HTMLElement>(selectors: string): Component<E> | null;
    selectAll<E extends HTMLElement = HTMLElement>(selectors: string): Component<E>[] | null;
    emit(type: string): void;
    on(type: string, handler: EventListener): void;
    off(type: string, handler: EventListener): void;
    removeAllEventListeners(type?: string): void;
    destroy(): void;
    protected didMount(): void;
    didUnmount(): void;
}
