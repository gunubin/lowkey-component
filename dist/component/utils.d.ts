/**
 * ShanordComponentにするデコ-レーター
 * 全ページで共通のコンポーネント
 * ページ遷移してもunmount / destroyされないコンポーネント
 */
export declare function sharedComponent<T extends {
    new (...args: any[]): {};
}>(constructor: T): {
    new (...args: any[]): {
        _isShared: boolean;
        _isMounted: boolean;
    };
    isShared: boolean;
} & T;
