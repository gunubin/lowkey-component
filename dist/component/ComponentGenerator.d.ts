import { ComponentMap, IComponentGenerator } from './types';
/**
 * ComponentGenerator
 */
export declare class ComponentGenerator implements IComponentGenerator {
    private map;
    private _documentBody;
    private _containers;
    constructor(map: ComponentMap);
    private ensureContainerExists;
    private createInstancesForContainer;
    initialize(): void;
    refresh(container?: HTMLElement | null): void;
    mount(container?: HTMLElement | null): void;
    private processUnmount;
    unmount(container?: HTMLElement | null): void;
}
