/**
 * Component Class
 */
class Component {
    constructor(element) {
        this.element = element;
        this.handlers = new Map();
        this.selected = new Map();
        this._isShared = false;
        this._isMounted = false;
        this.refs = {};
        //
    }
    // 全ページで共通のコンポーネント
    // ページ遷移してもunmount / destroyされないコンポーネント
    get isShared() {
        return this._isShared;
    }
    // HTMLElementに接続する
    mount() {
        if (this._isShared && this._isMounted) {
            return;
        }
        if (!this.element) {
            throw new ReferenceError('element is not found.');
        }
        this.selectRefs();
        this._isMounted = true;
        this.didMount();
    }
    selectRefs() {
        (Object.keys(this.refs)).forEach((refName) => {
            const ref = this.element.querySelector(`[ref=${refName}]`);
            if (ref) {
                this.refs = Object.assign(Object.assign({}, this.refs), { [refName]: new Component(ref) });
            }
        });
    }
    select(selectors) {
        const element = this.element.querySelector(selectors);
        const ret = element && new Component(element);
        ret && this.selected.set(selectors, ret);
        return ret;
    }
    selectAll(selectors) {
        const elements = Array.from(this.element.querySelectorAll(selectors));
        const ret = elements.map(element => {
            return new Component(element);
        });
        ret.length > 0 && this.selected.set(selectors, ret);
        return ret;
    }
    emit(type) {
        let event;
        if (typeof Event === 'function') {
            event = new Event(type);
        }
        else {
            event = document.createEvent('Event');
            event.initEvent(type, true, true);
        }
        this.element.dispatchEvent(event);
    }
    on(type, handler) {
        this.handlers.set(handler, type);
        this.element.addEventListener(type, handler);
    }
    off(type, handler) {
        this.handlers.delete(handler);
        this.element.removeEventListener(type, handler);
    }
    removeAllEventListeners(type) {
        const remove = [];
        this.handlers.forEach((t, h) => {
            if (!type || (type && t === type)) {
                this.element.removeEventListener(t, h);
                remove.push(h);
            }
        });
        remove.map((r) => {
            this.handlers.delete(r);
        });
    }
    destroy() {
        Object.values(this.refs).forEach((ref) => {
            ref === null || ref === void 0 ? void 0 : ref.destroy();
        });
        this.selected.forEach((item) => {
            if (Array.isArray(item)) {
                item.map(i => {
                    i.destroy();
                });
            }
            else {
                item.destroy();
            }
        });
        this.removeAllEventListeners();
        this.didUnmount();
    }
    // HTMLElementに接続されたコールバック関数
    didMount() {
        //
    }
    // HTMLElementから切断される前のコールバック関数
    willUnmount() {
        //
    }
    // HTMLElementから切断されたコールバック関数
    didUnmount() {
        //
    }
}
Component.isShared = false;

/**
 * reduxでjsの容量大きくならないように超雑に作ったstate管理マン
 * memo化もクソもないしパフォーマンス不安だけどｱｶﾝかったらredux使う
 */
class StoreProvider {
    constructor() {
        this.context = null;
    }
    static create() {
        if (StoreProvider.singleton) {
            return StoreProvider.singleton;
        }
        return (StoreProvider.singleton = new StoreProvider());
    }
    setContext(context) {
        this.context = context;
    }
    getContext() {
        if (!this.context) {
            throw Error('Store context does not exists');
        }
        return this.context;
    }
    dispatch(action) {
        return this.getContext().dispatch(action);
    }
    getState() {
        return this.getContext().getState();
    }
    subscribe(listener) {
        return this.getContext().subscribe(listener);
    }
}

var dist = {};

var Collector$1 = {};

Object.defineProperty(Collector$1, "__esModule", { value: true });
Collector$1.Collector = void 0;
/**
 * Base class for collectors.
 *
 * @typeparam THandler The function signature to be implemented by handlers.
 */
class Collector {
    /**
     * Create a new collector.
     *
     * @param signal The signal to emit.
     */
    constructor(signal) {
        // eslint-disable-next-line dot-notation
        this.emit = (...args) => {
            // eslint-disable-next-line dot-notation
            signal["emitCollecting"](this, args);
        };
    }
}
Collector$1.Collector = Collector;

var CollectorArray$1 = {};

Object.defineProperty(CollectorArray$1, "__esModule", { value: true });
CollectorArray$1.CollectorArray = void 0;
const Collector_1$3 = Collector$1;
/**
 * Returns the result of the all signal handlers from a signal emission in an array.
 *
 * @typeparam THandler The function signature to be implemented by handlers.
 */
class CollectorArray extends Collector_1$3.Collector {
    constructor() {
        super(...arguments);
        this.result = [];
    }
    handleResult(result) {
        this.result.push(result);
        return true;
    }
    /**
     * Get the list of results from the signal handlers.
     */
    getResult() {
        return this.result;
    }
    /**
     * Reset the result
     */
    reset() {
        this.result.length = 0;
    }
}
CollectorArray$1.CollectorArray = CollectorArray;

var CollectorLast$1 = {};

Object.defineProperty(CollectorLast$1, "__esModule", { value: true });
CollectorLast$1.CollectorLast = void 0;
const Collector_1$2 = Collector$1;
/**
 * Returns the result of the last signal handler from a signal emission.
 *
 * @typeparam THandler The function signature to be implemented by handlers.
 */
class CollectorLast extends Collector_1$2.Collector {
    handleResult(result) {
        this.result = result;
        return true;
    }
    /**
     * Get the result of the last signal handler.
     */
    getResult() {
        return this.result;
    }
    /**
     * Reset the result
     */
    reset() {
        delete this.result;
    }
}
CollectorLast$1.CollectorLast = CollectorLast;

var CollectorUntil0$1 = {};

Object.defineProperty(CollectorUntil0$1, "__esModule", { value: true });
CollectorUntil0$1.CollectorUntil0 = void 0;
const Collector_1$1 = Collector$1;
/**
 * Keep signal emissions going while all handlers return true.
 *
 * @typeparam THandler The function signature to be implemented by handlers.
 */
class CollectorUntil0 extends Collector_1$1.Collector {
    constructor() {
        super(...arguments);
        this.result = false;
    }
    handleResult(result) {
        this.result = result;
        return this.result;
    }
    /**
     * Get the result of the last signal handler.
     */
    getResult() {
        return this.result;
    }
    /**
     * Reset the result
     */
    reset() {
        this.result = false;
    }
}
CollectorUntil0$1.CollectorUntil0 = CollectorUntil0;

var CollectorWhile0$1 = {};

Object.defineProperty(CollectorWhile0$1, "__esModule", { value: true });
CollectorWhile0$1.CollectorWhile0 = void 0;
const Collector_1 = Collector$1;
/**
 * Keep signal emissions going while all handlers return false.
 *
 * @typeparam THandler The function signature to be implemented by handlers.
 */
class CollectorWhile0 extends Collector_1.Collector {
    constructor() {
        super(...arguments);
        this.result = false;
    }
    handleResult(result) {
        this.result = result;
        return !this.result;
    }
    /**
     * Get the result of the last signal handler.
     */
    getResult() {
        return this.result;
    }
    /**
     * Reset the result
     */
    reset() {
        this.result = false;
    }
}
CollectorWhile0$1.CollectorWhile0 = CollectorWhile0;

var Signal$1 = {};

var SignalConnection = {};

Object.defineProperty(SignalConnection, "__esModule", { value: true });
SignalConnection.SignalConnectionImpl = void 0;
/**
 * Implementation of SignalConnection, for internal use only.
 * @private
 */
class SignalConnectionImpl {
    /**
     * @param link The actual link of the connection.
     * @param parentCleanup Callback to cleanup the parent signal when a connection is disconnected
     */
    constructor(link, parentCleanup) {
        this.link = link;
        this.parentCleanup = parentCleanup;
    }
    disconnect() {
        if (this.link !== null) {
            this.link.unlink();
            this.link = null;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.parentCleanup();
            this.parentCleanup = null;
            return true;
        }
        return false;
    }
    set enabled(enable) {
        if (this.link)
            this.link.setEnabled(enable);
    }
    get enabled() {
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        return this.link !== null && this.link.isEnabled();
    }
}
SignalConnection.SignalConnectionImpl = SignalConnectionImpl;

var SignalLink$1 = {};

Object.defineProperty(SignalLink$1, "__esModule", { value: true });
SignalLink$1.SignalLink = void 0;
/**
 * SignalLink implements a doubly-linked ring with nodes containing the signal handlers.
 * @private
 */
class SignalLink {
    constructor(prev = null, next = null, order = 0) {
        this.enabled = true;
        this.newLink = false;
        this.callback = null;
        this.prev = prev !== null && prev !== void 0 ? prev : this;
        this.next = next !== null && next !== void 0 ? next : this;
        this.order = order;
    }
    isEnabled() {
        return this.enabled && !this.newLink;
    }
    setEnabled(flag) {
        this.enabled = flag;
    }
    unlink() {
        this.callback = null;
        this.next.prev = this.prev;
        this.prev.next = this.next;
    }
    insert(callback, order) {
        let after = this.prev;
        while (after !== this) {
            if (after.order <= order)
                break;
            after = after.prev;
        }
        const link = new SignalLink(after, after.next, order);
        link.callback = callback;
        after.next = link;
        link.next.prev = link;
        return link;
    }
}
SignalLink$1.SignalLink = SignalLink;

Object.defineProperty(Signal$1, "__esModule", { value: true });
Signal$1.Signal = void 0;
const SignalConnection_1 = SignalConnection;
const SignalLink_1 = SignalLink$1;
/**
 * A signal is a way to publish and subscribe to events.
 *
 * @typeparam THandler The function signature to be implemented by handlers.
 */
class Signal {
    constructor() {
        this.head = new SignalLink_1.SignalLink();
        this.hasNewLinks = false;
        this.emitDepth = 0;
        this.connectionsCount = 0;
    }
    /**
     * @returns The number of connections on this signal.
     */
    getConnectionsCount() {
        return this.connectionsCount;
    }
    /**
     * @returns true if this signal has connections.
     */
    hasConnections() {
        return this.connectionsCount > 0;
    }
    /**
     * Subscribe to this signal.
     *
     * @param callback This callback will be run when emit() is called.
     * @param order Handlers with a higher order value will be called later.
     */
    connect(callback, order = 0) {
        this.connectionsCount++;
        const link = this.head.insert(callback, order);
        if (this.emitDepth > 0) {
            this.hasNewLinks = true;
            link.newLink = true;
        }
        return new SignalConnection_1.SignalConnectionImpl(link, () => this.decrementConnectionCount());
    }
    decrementConnectionCount() {
        this.connectionsCount--;
    }
    /**
     * Unsubscribe from this signal with the original callback instance.
     * While you can use this method, the SignalConnection returned by connect() will not be updated!
     *
     * @param callback The callback you passed to connect().
     */
    disconnect(callback) {
        for (let link = this.head.next; link !== this.head; link = link.next) {
            if (link.callback === callback) {
                this.decrementConnectionCount();
                link.unlink();
                return true;
            }
        }
        return false;
    }
    /**
     * Disconnect all handlers from this signal event.
     */
    disconnectAll() {
        while (this.head.next !== this.head) {
            this.head.next.unlink();
        }
        this.connectionsCount = 0;
    }
    /**
     * Publish this signal event (call all handlers).
     */
    emit(...args) {
        this.emitDepth++;
        for (let link = this.head.next; link !== this.head; link = link.next) {
            if (link.isEnabled() && link.callback)
                link.callback.apply(null, args);
        }
        this.emitDepth--;
        this.unsetNewLink();
    }
    emitCollecting(collector, args) {
        this.emitDepth++;
        for (let link = this.head.next; link !== this.head; link = link.next) {
            if (link.isEnabled() && link.callback) {
                const result = link.callback.apply(null, args);
                if (!collector.handleResult(result))
                    break;
            }
        }
        this.emitDepth--;
        this.unsetNewLink();
    }
    unsetNewLink() {
        if (this.hasNewLinks && this.emitDepth === 0) {
            for (let link = this.head.next; link !== this.head; link = link.next)
                link.newLink = false;
            this.hasNewLinks = false;
        }
    }
}
Signal$1.Signal = Signal;

var SignalConnections$1 = {};

Object.defineProperty(SignalConnections$1, "__esModule", { value: true });
SignalConnections$1.SignalConnections = void 0;
/**
 * Represents a list of connections to a signal for easy disconnect.
 */
class SignalConnections {
    constructor() {
        this.list = [];
    }
    /**
     * Add a connection to the list.
     * @param connection
     */
    add(connection) {
        this.list.push(connection);
    }
    /**
     * Disconnect all connections in the list and empty the list.
     */
    disconnectAll() {
        for (const connection of this.list) {
            connection.disconnect();
        }
        this.list = [];
    }
    /**
     * @returns The number of connections in this list.
     */
    getCount() {
        return this.list.length;
    }
    /**
     * @returns true if this list is empty.
     */
    isEmpty() {
        return this.list.length === 0;
    }
}
SignalConnections$1.SignalConnections = SignalConnections;

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SignalConnections = exports.Signal = exports.CollectorWhile0 = exports.CollectorUntil0 = exports.CollectorLast = exports.CollectorArray = exports.Collector = void 0;
	var Collector_1 = Collector$1;
	Object.defineProperty(exports, "Collector", { enumerable: true, get: function () { return Collector_1.Collector; } });
	var CollectorArray_1 = CollectorArray$1;
	Object.defineProperty(exports, "CollectorArray", { enumerable: true, get: function () { return CollectorArray_1.CollectorArray; } });
	var CollectorLast_1 = CollectorLast$1;
	Object.defineProperty(exports, "CollectorLast", { enumerable: true, get: function () { return CollectorLast_1.CollectorLast; } });
	var CollectorUntil0_1 = CollectorUntil0$1;
	Object.defineProperty(exports, "CollectorUntil0", { enumerable: true, get: function () { return CollectorUntil0_1.CollectorUntil0; } });
	var CollectorWhile0_1 = CollectorWhile0$1;
	Object.defineProperty(exports, "CollectorWhile0", { enumerable: true, get: function () { return CollectorWhile0_1.CollectorWhile0; } });
	var Signal_1 = Signal$1;
	Object.defineProperty(exports, "Signal", { enumerable: true, get: function () { return Signal_1.Signal; } });
	var SignalConnections_1 = SignalConnections$1;
	Object.defineProperty(exports, "SignalConnections", { enumerable: true, get: function () { return SignalConnections_1.SignalConnections; } });
} (dist));

const dispatcher = new dist.Signal();
function createStore(reducer) {
    let store;
    const dispatch = (action) => {
        store = reducer(store, action);
        dispatcher.emit(action);
        return store;
    };
    const subscribe = (listener) => {
        const ret = dispatcher.connect(listener);
        return ret.enabled ? () => ret.disconnect() : () => {
            /* empty function */
        };
    };
    return {
        dispatch,
        getState: () => store,
        subscribe,
    };
}

function createSlice({ initialValues, reducers }) {
    const actions = Object.keys(reducers).reduce((acc, key) => {
        return Object.assign(Object.assign({}, acc), { [key]: (payload) => ({ payload, type: key }) });
    }, {});
    const reducer = (state = initialValues, action) => {
        const reducer = reducers[action.type];
        // TODO: reducerによってstateが変更されreturnしている（オブジェクト参照が気になり）
        reducer === null || reducer === void 0 ? void 0 : reducer(state, action);
        return state;
    };
    return {
        actions,
        getInitialValues: () => initialValues,
        reducer,
    }; /* TODO: types */
}

const createSelector = (selector, selectReturn) => {
    return (state) => {
        const val = selector(state);
        return selectReturn(val);
    };
};

const combineReducers = (reducers) => {
    return (state, action) => {
        const nextState = {};
        Object.entries(reducers).forEach(([key, reducer]) => {
            const prevState = state && state[key];
            nextState[key] = reducer(prevState, action);
        });
        return nextState;
    };
};

var keyList = Object.keys;

var equal = function equal (a, b) {
  if (a === b) return true;
  if (!(a instanceof Object) || !(b instanceof Object)) return false;

  var keys = keyList(a);
  var length = keys.length;

  for (var i = 0; i < length; i++)
    if (!(keys[i] in b)) return false;

  for (var i = 0; i < length; i++)
    if (a[keys[i]] !== b[keys[i]]) return false;

  return length === keyList(b).length;
};

/**
 * 簡単なメモ化機能付き
 */
const observeStore = (selector, store, initialState, onChange, options) => {
    const { equalityFn = equal } = options || {};
    let currentState = initialState;
    function handleChange() {
        const nextState = selector(store.getState());
        const isSameState = equalityFn(nextState, currentState);
        if (!isSameState) {
            currentState = nextState;
            onChange(currentState);
        }
    }
    const unsubscribe = store.subscribe(handleChange);
    handleChange();
    return unsubscribe;
};
// export const observeStore = <TSelector extends Selector>(
//   selector: TSelector,
//   redux: ReduxState,
//   initialState: ReturnType<TSelector>,
//   onChange: (val: ReturnType<TSelector>) => void,
//   options?: {
//     equalityFn?: Function;
//   },
// ) => {
//   const {equalityFn = shallowEqual} = options || {};
//   let currentState = initialState;
//
//   // let currentState: any;
//
//   function handleChange() {
//     let nextState = selector(redux.getState()) as ReturnType<TSelector>;
//     const same = equalityFn(nextState, currentState);
//     if (!same) {
//       currentState = nextState;
//       onChange(currentState);
//     }
//   }
//
//   let unsubscribe = redux.subscribe(handleChange);
//   handleChange();
//   return unsubscribe;
// };

/**
 * storeのsubscribeのunsubscribeし忘れないようにするためだけのクラス
 */
class ConnectedComponent extends Component {
    constructor() {
        super(...arguments);
        this.unsubscribes = new Map();
        this.store = StoreProvider.create();
    }
    observe(selector, onChange) {
        const state = this.store.getState();
        const initialValue = selector(state);
        this.unsubscribes.set(selector, observeStore(selector, this.store, initialValue, onChange));
        return initialValue;
    }
    didUnmount() {
        this.unsubscribes.forEach((unsubscribe) => unsubscribe());
    }
}
// FIXME: decorateした側のClassで型解決できないので不可能
// https://github.com/microsoft/TypeScript/issues/4881
//  https://stackoverflow.com/questions/36512151/typescript-class-decorators-add-class-method
// export function connect<T extends {new (...args: any[]): {}}>(constructor: T) {
//   return class extends constructor {
//     private unsubscribes: Map<Selector, Unsubscribe> = new Map();
//
//     observe<TSelector extends Selector>(
//       selector: TSelector,
//       onChange: (val: ReturnType<TSelector>) => void,
//     ) {
//       this.unsubscribes.set(selector, observeStore(selector, onChange));
//     }
//
//     willUnmount() {
//       this.unsubscribes.forEach((unsubscribe) => unsubscribe());
//     }
//   };
// }
// (<any>project).test() 型キャストでできるけど type safeじゃない
// これは型キャスト用 (this as any as IConnectedComponent).observe()
// export interface IConnectedComponent {
//   observe: <TSelector extends Selector>(
//     selector: TSelector,
//     onChange: (val: ReturnType<TSelector>) => void,
//   ) => void;
// }

/**
 * ComponentGenerator
 */
class ComponentGenerator {
    constructor(map) {
        this.map = map;
        this._components = new Map();
    }
    initialize() {
        Object.entries(this.map).map(([selectors, ComponentClass]) => {
            const elements = Array.from(document.querySelectorAll(selectors));
            const ret = elements === null || elements === void 0 ? void 0 : elements.map((element) => {
                return new ComponentClass(element);
            });
            this._components.set(selectors, ret);
        });
    }
    refresh() {
        Object.entries(this.map).map(([selectors, ComponentClass]) => {
            const elements = Array.from(document.querySelectorAll(selectors));
            const ret = elements === null || elements === void 0 ? void 0 : elements.map((element) => {
                if (!ComponentClass.isShared) {
                    return new ComponentClass(element);
                }
            }).filter((c) => !!c);
            this._components.set(selectors, ret);
        });
    }
    mount() {
        this._components.forEach((components) => {
            components.map((component) => component.mount());
        });
    }
    willUnmount() {
        this._components.forEach((components) => {
            components.map((component) => {
                if (!component.isShared) {
                    component.element && component.willUnmount();
                }
            });
        });
    }
    unmount() {
        this._components.forEach((components, selectors) => {
            components.map((component) => {
                if (!component.isShared) {
                    this._components.delete(selectors);
                    component.element && component.destroy();
                }
            });
        });
    }
}

/**
 * ShanordComponentにするデコ-レーター
 * 全ページで共通のコンポーネント
 * ページ遷移してもunmount / destroyされないコンポーネント
 */
function sharedComponent(constructor) {
    var _a;
    return _a = class extends constructor {
            constructor(...args) {
                super(...args);
                this._isShared = true;
                this._isMounted = false;
            }
        },
        _a.isShared = true,
        _a;
}

export { Component, ComponentGenerator, ConnectedComponent, StoreProvider, combineReducers, createSelector, createSlice, createStore, sharedComponent };
