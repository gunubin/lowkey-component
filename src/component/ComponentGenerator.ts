import {Component} from './Component'
import {ConnectedComponent} from './ConnectedComponent'
import {IComponentGenerator, Refs} from './types'

type ComponentCreator<THTMLElement extends HTMLElement = any, TRefs extends Refs = Refs> = new (
  element: THTMLElement,
) => Component<THTMLElement, TRefs> | ConnectedComponent<THTMLElement, TRefs>;

export type ComponentMap = {
  [selector: string]: ComponentCreator;
};

/**
 * ComponentGenerator
 */
export class ComponentGenerator implements IComponentGenerator {
  private _components: Map<string, Array<Component | ConnectedComponent>> = new Map()

  constructor(private map: ComponentMap) {
  }

  public initialize() {
    Object.entries(this.map).map(([selectors, ComponentClass]) => {
      const elements = Array.from(document.querySelectorAll(selectors) as NodeListOf<HTMLElement>)

      const ret = elements?.map((element) => {
        return new ComponentClass(element)
      })
      this._components.set(selectors, ret)
    })
  }

  public refresh() {
    Object.entries(this.map).map(([selectors, ComponentClass]) => {
      const elements = Array.from(document.querySelectorAll(selectors))
      const ret = elements
      ?.map((element) => {
        if (!(ComponentClass as typeof Component).isShared) {
          return new ComponentClass(element)
        }
      })
      .filter((c) => !!c) as Component[]
      this._components.set(selectors, ret)
    })
  }

  public mount() {
    this._components.forEach((components) => {
      components.map((component) => component.mount())
    })
  }

  public willUnmount() {
    this._components.forEach((components) => {
      components.map((component) => {
        if (!component.isShared) {
          component.element && component.willUnmount()
        }
      })
    })
  }

  public unmount() {
    this._components.forEach((components, selectors) => {
      components.map((component) => {
        if (!component.isShared) {
          this._components.delete(selectors)
          component.element && component.destroy()
        }
      })
    })
  }
}
