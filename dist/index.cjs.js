'use strict';

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

exports.Component = Component;
exports.ComponentGenerator = ComponentGenerator;
exports.ConnectedComponent = ConnectedComponent;
exports.StoreProvider = StoreProvider;
