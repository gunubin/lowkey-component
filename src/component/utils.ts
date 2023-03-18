/**
 * ShanordComponentにするデコ-レーター
 * 全ページで共通のコンポーネント
 * ページ遷移してもunmount / destroyされないコンポーネント
 */
export function sharedComponent<T extends {new(...args: any[]): {}}>(
  constructor: T,
) {
  return class extends constructor {
    static isShared = true
    _isShared: boolean
    _isMounted: boolean

    constructor(...args: any[]) {
      super(...args)
      this._isShared = true
      this._isMounted = false
    }

  }
}
