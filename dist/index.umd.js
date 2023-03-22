(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.YourPackageName = {}));
})(this, (function (exports) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    /**
     * Component Class
     */
    var Component = /** @class */ (function () {
        function Component(element) {
            this.element = element;
            this.handlers = new Map();
            this.selected = new Map();
            this._isShared = false;
            this._isMounted = false;
            this.refs = {};
            //
        }
        Object.defineProperty(Component.prototype, "isShared", {
            // 全ページで共通のコンポーネント
            // ページ遷移してもunmount / destroyされないコンポーネント
            get: function () {
                return this._isShared;
            },
            enumerable: false,
            configurable: true
        });
        // HTMLElementに接続する
        Component.prototype.mount = function () {
            if (this._isShared && this._isMounted) {
                return;
            }
            if (!this.element) {
                throw new ReferenceError('element is not found.');
            }
            this.selectRefs();
            this._isMounted = true;
            this.didMount();
        };
        Component.prototype.selectRefs = function () {
            var _this = this;
            (Object.keys(this.refs)).forEach(function (refName) {
                var _a;
                var ref = _this.element.querySelector("[ref=".concat(refName, "]"));
                if (ref) {
                    _this.refs = __assign(__assign({}, _this.refs), (_a = {}, _a[refName] = new Component(ref), _a));
                }
            });
        };
        Component.prototype.select = function (selectors) {
            var element = this.element.querySelector(selectors);
            var ret = element && new Component(element);
            ret && this.selected.set(selectors, ret);
            return ret;
        };
        Component.prototype.selectAll = function (selectors) {
            var elements = Array.from(this.element.querySelectorAll(selectors));
            var ret = elements.map(function (element) {
                return new Component(element);
            });
            ret.length > 0 && this.selected.set(selectors, ret);
            return ret;
        };
        Component.prototype.emit = function (type) {
            var event;
            if (typeof Event === 'function') {
                event = new Event(type);
            }
            else {
                event = document.createEvent('Event');
                event.initEvent(type, true, true);
            }
            this.element.dispatchEvent(event);
        };
        Component.prototype.on = function (type, handler) {
            this.handlers.set(handler, type);
            this.element.addEventListener(type, handler);
        };
        Component.prototype.off = function (type, handler) {
            this.handlers.delete(handler);
            this.element.removeEventListener(type, handler);
        };
        Component.prototype.removeAllEventListeners = function (type) {
            var _this = this;
            var remove = [];
            this.handlers.forEach(function (t, h) {
                if (!type || (type && t === type)) {
                    _this.element.removeEventListener(t, h);
                    remove.push(h);
                }
            });
            remove.map(function (r) {
                _this.handlers.delete(r);
            });
        };
        Component.prototype.destroy = function () {
            Object.values(this.refs).forEach(function (ref) {
                ref === null || ref === void 0 ? void 0 : ref.destroy();
            });
            this.selected.forEach(function (item) {
                if (Array.isArray(item)) {
                    item.map(function (i) {
                        i.destroy();
                    });
                }
                else {
                    item.destroy();
                }
            });
            this.removeAllEventListeners();
            this.didUnmount();
        };
        // HTMLElementに接続されたコールバック関数
        Component.prototype.didMount = function () {
            //
        };
        // HTMLElementから切断される前のコールバック関数
        Component.prototype.willUnmount = function () {
            //
        };
        // HTMLElementから切断されたコールバック関数
        Component.prototype.didUnmount = function () {
            //
        };
        Component.isShared = false;
        return Component;
    }());

    /**
     * reduxでjsの容量大きくならないように超雑に作ったstate管理マン
     * memo化もクソもないしパフォーマンス不安だけどｱｶﾝかったらredux使う
     */
    var StoreProvider = /** @class */ (function () {
        function StoreProvider() {
            this.context = null;
        }
        StoreProvider.create = function () {
            if (StoreProvider.singleton) {
                return StoreProvider.singleton;
            }
            return (StoreProvider.singleton = new StoreProvider());
        };
        StoreProvider.prototype.setContext = function (context) {
            this.context = context;
        };
        StoreProvider.prototype.getContext = function () {
            if (!this.context) {
                throw Error('Store context does not exists');
            }
            return this.context;
        };
        StoreProvider.prototype.dispatch = function (action) {
            return this.getContext().dispatch(action);
        };
        StoreProvider.prototype.getState = function () {
            return this.getContext().getState();
        };
        StoreProvider.prototype.subscribe = function (listener) {
            return this.getContext().subscribe(listener);
        };
        return StoreProvider;
    }());

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

    var dispatcher = new dist.Signal();
    function createStore(reducer) {
        var store;
        var dispatch = function (action) {
            store = reducer(store, action);
            dispatcher.emit(action);
            return store;
        };
        var subscribe = function (listener) {
            var ret = dispatcher.connect(listener);
            return ret.enabled ? function () { return ret.disconnect(); } : function () {
                /* empty function */
            };
        };
        return {
            dispatch: dispatch,
            getState: function () { return store; },
            subscribe: subscribe,
        };
    }

    function createSlice(_a) {
        var initialValues = _a.initialValues, reducers = _a.reducers;
        var actions = Object.keys(reducers).reduce(function (acc, key) {
            var _a;
            return __assign(__assign({}, acc), (_a = {}, _a[key] = function (payload) { return ({ payload: payload, type: key }); }, _a));
        }, {});
        var reducer = function (state, action) {
            if (state === void 0) { state = initialValues; }
            var reducer = reducers[action.type];
            // TODO: reducerによってstateが変更されreturnしている（オブジェクト参照が気になり）
            reducer === null || reducer === void 0 ? void 0 : reducer(state, action);
            return state;
        };
        return {
            actions: actions,
            getInitialValues: function () { return initialValues; },
            reducer: reducer,
        }; /* TODO: types */
    }

    var createSelector = function (selector, selectReturn) {
        return function (state) {
            var val = selector(state);
            return selectReturn(val);
        };
    };

    var combineReducers = function (reducers) {
        return function (state, action) {
            var nextState = {};
            Object.entries(reducers).forEach(function (_a) {
                var key = _a[0], reducer = _a[1];
                var prevState = state && state[key];
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
    var observeStore = function (selector, store, initialState, onChange, options) {
        var _a = (options || {}).equalityFn, equalityFn = _a === void 0 ? equal : _a;
        var currentState = initialState;
        function handleChange() {
            var nextState = selector(store.getState());
            var isSameState = equalityFn(nextState, currentState);
            if (!isSameState) {
                currentState = nextState;
                onChange(currentState);
            }
        }
        var unsubscribe = store.subscribe(handleChange);
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
    var ConnectedComponent = /** @class */ (function (_super) {
        __extends(ConnectedComponent, _super);
        function ConnectedComponent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.unsubscribes = new Map();
            _this.store = StoreProvider.create();
            return _this;
        }
        ConnectedComponent.prototype.observe = function (selector, onChange) {
            var state = this.store.getState();
            var initialValue = selector(state);
            this.unsubscribes.set(selector, observeStore(selector, this.store, initialValue, onChange));
            return initialValue;
        };
        ConnectedComponent.prototype.willUnmount = function () {
            this.unsubscribes.forEach(function (unsubscribe) { return unsubscribe(); });
        };
        return ConnectedComponent;
    }(Component));
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
    var ComponentGenerator = /** @class */ (function () {
        function ComponentGenerator(map) {
            this.map = map;
            this._components = new Map();
        }
        ComponentGenerator.prototype.initialize = function () {
            var _this = this;
            Object.entries(this.map).map(function (_a) {
                var selectors = _a[0], ComponentClass = _a[1];
                var elements = Array.from(document.querySelectorAll(selectors));
                var ret = elements === null || elements === void 0 ? void 0 : elements.map(function (element) {
                    return new ComponentClass(element);
                });
                _this._components.set(selectors, ret);
            });
        };
        ComponentGenerator.prototype.refresh = function () {
            var _this = this;
            Object.entries(this.map).map(function (_a) {
                var selectors = _a[0], ComponentClass = _a[1];
                var elements = Array.from(document.querySelectorAll(selectors));
                var ret = elements === null || elements === void 0 ? void 0 : elements.map(function (element) {
                    if (!ComponentClass.isShared) {
                        return new ComponentClass(element);
                    }
                }).filter(function (c) { return !!c; });
                _this._components.set(selectors, ret);
            });
        };
        ComponentGenerator.prototype.mount = function () {
            this._components.forEach(function (components) {
                components.map(function (component) { return component.mount(); });
            });
        };
        ComponentGenerator.prototype.willUnmount = function () {
            this._components.forEach(function (components) {
                components.map(function (component) {
                    if (!component.isShared) {
                        component.element && component.willUnmount();
                    }
                });
            });
        };
        ComponentGenerator.prototype.unmount = function () {
            var _this = this;
            this._components.forEach(function (components, selectors) {
                components.map(function (component) {
                    if (!component.isShared) {
                        _this._components.delete(selectors);
                        component.element && component.destroy();
                    }
                });
            });
        };
        return ComponentGenerator;
    }());

    /**
     * ShanordComponentにするデコ-レーター
     * 全ページで共通のコンポーネント
     * ページ遷移してもunmount / destroyされないコンポーネント
     */
    function sharedComponent(constructor) {
        var _a;
        return _a = /** @class */ (function (_super) {
                __extends(class_1, _super);
                function class_1() {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var _this = _super.apply(this, args) || this;
                    _this._isShared = true;
                    _this._isMounted = false;
                    return _this;
                }
                return class_1;
            }(constructor)),
            _a.isShared = true,
            _a;
    }

    exports.Component = Component;
    exports.ComponentGenerator = ComponentGenerator;
    exports.ConnectedComponent = ConnectedComponent;
    exports.StoreProvider = StoreProvider;
    exports.combineReducers = combineReducers;
    exports.createSelector = createSelector;
    exports.createSlice = createSlice;
    exports.createStore = createStore;
    exports.sharedComponent = sharedComponent;

}));
