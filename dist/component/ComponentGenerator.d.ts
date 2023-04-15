import { ComponentMap, IComponentGenerator } from './types';
/**
 * ComponentGenerator
 */
export declare class ComponentGenerator implements IComponentGenerator {
    private map;
    private _containers;
    constructor(map: ComponentMap);
    private checkContainer;
    private createInstances;
    initialize(container?: HTMLElement | null): void;
    refresh(container?: HTMLElement | null): void;
    mount(container?: HTMLElement | null): void;
    unmount(container?: HTMLElement | null): void;
}
