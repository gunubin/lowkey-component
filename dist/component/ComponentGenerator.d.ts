import { Component } from './Component';
import { ConnectedComponent } from './ConnectedComponent';
import { IComponentGenerator, Refs } from './types';
type ComponentCreator<THTMLElement extends HTMLElement = any, TRefs extends Refs = Refs> = new (element: THTMLElement) => Component<THTMLElement, TRefs> | ConnectedComponent<THTMLElement, TRefs>;
export type ComponentMap = {
    [selector: string]: ComponentCreator;
};
/**
 * ComponentGenerator
 */
export declare class ComponentGenerator implements IComponentGenerator {
    private map;
    private _components;
    constructor(map: ComponentMap);
    initialize(): void;
    refresh(): void;
    mount(): void;
    willUnmount(): void;
    unmount(): void;
}
export {};
