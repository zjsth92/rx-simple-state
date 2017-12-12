'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SingleTon = undefined;
var LastRxContext = undefined;

var createRxSimpleState = function createRxSimpleState(Rx) {
    if (SingleTon && LastRxContext) {
        if (LastRxContext === Rx) {
            return SingleTon;
        } else {
            if (process.env.NODE_ENV !== 'production') console.warn('Changing RxJS Context will create a new store');
        }
    }
    var store = new Rx.ReplaySubject(1);
    var subj = new Rx.Subject();

    var createStore = function createStore(combinedReducer) {
        var preloadState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

        subj.startWith(preloadState).scan(combinedReducer).subscribe(store);
        return store;
    };

    var connect = function connect(mapToState) {
        store.subscribe({
            next: function next(state) {
                if (typeof state !== 'undefined') {
                    mapToState(state);
                }
            },
            error: function error(err) {
                return console.error('something wrong occurred: ' + err);
            }
        });
    };

    var connectReact = function connectReact(React, Component, mapToState) {
        var ConnectedComponent = function (_React$Component) {
            _inherits(ConnectedComponent, _React$Component);

            function ConnectedComponent() {
                var _ref;

                var _temp, _this, _ret;

                _classCallCheck(this, ConnectedComponent);

                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ConnectedComponent.__proto__ || Object.getPrototypeOf(ConnectedComponent)).call.apply(_ref, [this].concat(args))), _this), _this.__handleStoreStateUpdate = function (state) {
                    _this.setState(state);
                }, _temp), _possibleConstructorReturn(_this, _ret);
            }

            _createClass(ConnectedComponent, [{
                key: 'componentDidMount',
                value: function componentDidMount() {
                    var _this2 = this;

                    store.subscribe({
                        next: function next(state) {
                            if (typeof state !== 'undefined') {
                                _this2.__handleStoreStateUpdate(mapToState(state));
                            }
                        },
                        error: function error(err) {
                            return console.error('something wrong occurred: ' + err);
                        }
                    });
                }
            }, {
                key: 'render',
                value: function render() {
                    return React.createElement(Component, this.state);
                }
            }]);

            return ConnectedComponent;
        }(React.Component);

        return ConnectedComponent;
    };

    var connectWxPage = function connectWxPage(pageConfig, mapToData) {
        var _onLoad = pageConfig.onLoad;
        // const _onUnLoad = pageConfig.onUnLoad;

        var onLoad = function onLoad(options) {
            var _this3 = this;

            store.subscribe({
                next: function next(state) {
                    if (typeof state !== 'undefined') {
                        _this3.setData(mapToData(state));
                    }
                },
                error: function error(err) {
                    return console.error('something wrong occurred: ' + err);
                }
            });
            if (typeof _onLoad === 'function') {
                _onLoad.call(this, options);
            }
        };
        return Object.assign(pageConfig, { onLoad: onLoad });
    };

    var combineReducers = function combineReducers(reducers) {
        return function () {
            var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var action = arguments[1];

            var keys = Object.keys(reducers);
            var hasChanged = false;
            var nextState = {};
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var reducer = reducers[key];
                var previousStateForKey = state[key];
                var nextStateForKey = reducer(previousStateForKey, action);
                nextState[key] = nextStateForKey;
                hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
            }
            return hasChanged ? nextState : state;
        };
    };

    var isPromise = function isPromise(val) {
        return val && typeof val.then === 'function';
    };

    var toObservable = function toObservable(action) {
        if (isPromise(action)) {
            return Rx.Observable.fromPromise(action);
        } else {
            if (typeof action.preload !== 'undefined') {
                if (isPromise(action.preload)) {
                    var source = Rx.Observable.fromPromise(action.preload);
                    return Object.assign(action, { preload: source });
                } else if (!action.preload instanceof Rx.Observable) {
                    var _source = Rx.Observable.from(action.preload);
                    return Object.assign(action, { preload: _source });
                }
            }
        }
        return action;
    };

    var dispatch = function dispatch(action) {
        if (typeof action === 'undefined') throw Error('action cannot be null or undefined');
        var finalAction = toObservable(action);

        if (finalAction instanceof Rx.Observable) {
            finalAction.subscribe({
                next: function next(val) {
                    return dispatch(val);
                }
            });
        } else if (finalAction.preload instanceof Rx.Observable) {
            finalAction.preload.subscribe({
                next: function next(val) {
                    return dispatch(val);
                }
            });
        } else {
            subj.next(action);
        }
    };

    SingleTon = {
        createStore: createStore,
        connect: connect,
        connectReact: connectReact,
        connectWxPage: connectWxPage,
        dispatch: dispatch,
        combineReducers: combineReducers
    };
    LastRxContext = Rx;
    return SingleTon;
};

module.exports = createRxSimpleState;