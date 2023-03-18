import {Refs} from './types'

type RefElementType<T> = T extends Component<infer U> ? U : never;

/**
 * Component Class
 */
export class Component<THTMLElement extends HTMLElement = HTMLElement, TRefs extends Refs = Refs> {
  static isShared = false
  private handlers: Map<EventListener, string> = new Map()
  private selected: Map<string, Component | Component[]> = new Map()
  protected _isShared = false
  protected _isMounted = false
  protected refs: TRefs = {} as TRefs

  constructor(public element: THTMLElement) {
    //
  }

  // 全ページで共通のコンポーネント
  // ページ遷移してもunmount / destroyされないコンポーネント
  public get isShared() {
    return this._isShared
  }

  // HTMLElementに接続する
  public mount() {
    if (this._isShared && this._isMounted) {
      return
    }

    if (!this.element) {
      throw new ReferenceError('element is not found.')
    }

    this.selectRefs()

    this._isMounted = true
    this.didMount()
  }

  private selectRefs() {
    (Object.keys(this.refs)).forEach((refName) => {
      const ref = this.element.querySelector(`[ref=${refName}]`) as RefElementType<TRefs[keyof TRefs]>;
      if (ref) {
        this.refs = {...this.refs, [refName]: new Component(ref)}
      }
    });
  }

  public select<E extends HTMLElement = HTMLElement>(selectors: string): Component<E> | null {
    const element = this.element.querySelector<E>(selectors)
    const ret = element && new Component<E>(element)
    ret && this.selected.set(selectors, ret)
    return ret
  }

  public selectAll<E extends HTMLElement = HTMLElement>(selectors: string): Component<E>[] | null {
    const elements = Array.from(this.element.querySelectorAll<E>(selectors))
    const ret = elements.map(element => {
      return new Component<E>(element)
    })
    ret.length > 0 && this.selected.set(selectors, ret)
    return ret
  }

  public emit(type: string) {
    let event: Event

    if (typeof Event === 'function') {
      event = new Event(type)
    } else {
      event = document.createEvent('Event')
      event.initEvent(type, true, true)
    }
    this.element.dispatchEvent(event)
  }

  public on(type: string, handler: EventListener) {
    this.handlers.set(handler, type)
    this.element.addEventListener(type, handler)
  }

  public off(type: string, handler: EventListener) {
    this.handlers.delete(handler)
    this.element.removeEventListener(type, handler)
  }

  public removeAllEventListeners(type?: string) {
    const remove: EventListener[] = []
    this.handlers.forEach((t, h) => {
      if (!type || (type && t === type)) {
        this.element.removeEventListener(t, h)
        remove.push(h)
      }
    })
    remove.map((r) => {
      this.handlers.delete(r)
    })
  }

  public destroy() {
    Object.values(this.refs).forEach((ref) => {
      ref?.destroy()
    })
    this.selected.forEach((item) => {
      if (Array.isArray(item)) {
        item.map(i => {
          i.destroy()
        })
      } else {
        item.destroy()
      }
    })
    this.removeAllEventListeners()
    this.didUnmount()
  }

  // HTMLElementに接続されたコールバック関数
  protected didMount(): void {
    //
  }

  // HTMLElementから切断される前のコールバック関数
  public willUnmount(): void {
    //
  }

  // HTMLElementから切断されたコールバック関数
  public didUnmount(): void {
    //
  }
}
