import { Component } from './Component';
import { ConnectedComponent } from './ConnectedComponent';
import { ComponentMap, IComponentGenerator } from './types';

type InstancesMap = Map<string, Array<Component | ConnectedComponent>>;
type ContainerMap = Map<HTMLElement, InstancesMap>;

/**
 * ComponentGenerator
 */
export class ComponentGenerator implements IComponentGenerator {
  private _containers: ContainerMap = new Map();

  constructor(private map: ComponentMap) {}

  private checkContainer(container: HTMLElement | null): HTMLElement {
    if (!container) {
      throw new Error('container is not found.');
    }
    return container;
  }

  private createInstances(container: HTMLElement, instancesMap: InstancesMap) {
    Object.entries(this.map).forEach(([selectors, ComponentClass]) => {
      const elements = Array.from(container.querySelectorAll(selectors));

      const instances = elements.map((element) => {
        return new ComponentClass(element);
      });
      instancesMap.set(selectors, instances);
    });
  }

  public initialize(container: HTMLElement | null = document.body) {
    container = this.checkContainer(container);
    const instancesMap: InstancesMap = new Map();
    this._containers.set(container, instancesMap);

    this.createInstances(container, instancesMap);
  }

  public refresh(container: HTMLElement | null = document.body) {
    container = this.checkContainer(container);
    const instancesMap: InstancesMap = this._containers.get(container) || new Map();

    this.createInstances(container, instancesMap);
    this._containers.set(container, instancesMap);
  }

  public mount(container: HTMLElement | null = document.body) {
    container = this.checkContainer(container);
    const instancesMap = this._containers.get(container);
    instancesMap?.forEach((components) => {
      components.forEach((component) => component.mount());
    });
  }

  public unmount(container: HTMLElement | null = document.body) {
    container = this.checkContainer(container);
    const instancesMap = this._containers.get(container);
    instancesMap?.forEach((components, selectors) => {
      components.forEach((component) => {
        instancesMap.delete(selectors);
        component.destroy();
      });
    });
    this._containers.delete(container);
  }
}
