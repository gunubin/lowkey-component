import { Component } from './Component';
import { ConnectedComponent } from './ConnectedComponent';
import { ComponentMap, IComponentGenerator } from './types';

type InstancesMap = Map<string, Array<Component | ConnectedComponent>>;
type ContainerMap = Map<HTMLElement, InstancesMap>;

/**
 * ComponentGenerator
 * Convert DOM elements to components based on ComponentMap.
 */
export class ComponentGenerator implements IComponentGenerator {
  private _documentBody: HTMLElement | null = null;
  private _containers: ContainerMap = new Map();

  constructor(private map: ComponentMap) {}

  private ensureContainerExists(container: HTMLElement | null): HTMLElement {
    if (!container) {
      throw new Error('container is not found.');
    }
    return container;
  }

  private createInstancesForContainer(container: HTMLElement, instancesMap: InstancesMap) {
    Object.entries(this.map).forEach(([selector, ComponentClass]) => {
      const elements = Array.from(container.querySelectorAll(selector));

      const instances = elements.map((element) => new ComponentClass(element));
      instancesMap.set(selector, instances);
    });
  }

  public initialize() {
    this._documentBody = document.body;
    const instancesMap: InstancesMap = new Map();
    this._containers.set(this._documentBody, instancesMap);

    this.createInstancesForContainer(this._documentBody, instancesMap);
  }

  public refresh(container: HTMLElement | null = document.body) {
    container = this.ensureContainerExists(container);
    const instancesMap: InstancesMap = this._containers.get(container) || new Map();

    this.createInstancesForContainer(container, instancesMap);
    this._containers.set(container, instancesMap);
  }

  public mount(container: HTMLElement | null = document.body) {
    container = this.ensureContainerExists(container);
    const instancesMap = this._containers.get(container);
    instancesMap?.forEach((components) => {
      components.forEach((component) => component.mount());
    });
  }

  private processUnmount(
    container: HTMLElement | null = document.body,
    destroyProcess: (component: Component, selector: string, instancesMap?: InstancesMap) => void,
  ) {
    container = this.ensureContainerExists(container);
    const instancesMap = this._containers.get(container);
    instancesMap?.forEach((components, selector) => {
      components.forEach((component) => {
        destroyProcess(component, selector, instancesMap);
      });
    });
    this._containers.delete(container);
  }

  // containerがdocument.bodyから削除されたタイミングで呼ぶこと。
  // 削除されずに実行すると、this._documentBodyに紐付いたComponentが破棄されずにメモリリークする
  public unmount(container: HTMLElement | null = document.body) {
    this.processUnmount(
      this._documentBody,
      (component, selector, instancesMap) => {
        if (!this._documentBody?.contains(component.element)) {
          instancesMap?.delete(selector);
          component.destroy();
        }
      },
    );
    this.processUnmount(
      container,
      (component, selector, instancesMap) => {
        instancesMap?.delete(selector);
        component.destroy();
      },
    );
  }
}
