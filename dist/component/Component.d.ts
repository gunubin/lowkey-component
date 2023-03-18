import { Refs } from './types';
/**
 * Component Class
 */
export declare class Component<THTMLElement extends HTMLElement = HTMLElement, TRefs extends Refs = Refs> {
    element: THTMLElement;
    static isShared: boolean;
    private handlers;
    private selected;
    protected _isShared: boolean;
    protected _isMounted: boolean;
    protected refs: TRefs;
    constructor(element: THTMLElement);
    get isShared(): boolean;
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
    willUnmount(): void;
    didUnmount(): void;
}
