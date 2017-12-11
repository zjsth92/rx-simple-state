import Rx from 'rxjs/Rx';

const store = new Rx.ReplaySubject(1);
const subj = new Rx.Subject();

export const createStore = (combinedReducer, preloadState = undefined) => {
    subj
        .startWith(preloadState)
        .scan(combinedReducer)
        .subscribe(store);
    return store;
}

export const connect = (mapToState) => {
    store.subscribe({
        next: (state) => {
            if (typeof state !== 'undefined') {
                mapToState(state);
            }
        },
        error: err => console.error('something wrong occurred: ' + err),
    })
}

export const connectReact = (React, Component, mapToState) => {
    class ConnectedComponent extends React.Component {

        componentDidMount() {
            store.subscribe({
                next: (state) => {
                    if (typeof state !== 'undefined') {
                        this.__handleStoreStateUpdate(mapToState(state));
                    }
                },
                error: err => console.error('something wrong occurred: ' + err),
            })
        }

        __handleStoreStateUpdate = (state) => {
            this.setState(state);
        }

        render() {
            return (<Component {...this.state} />)
        }
    }
    return ConnectedComponent;
}

export const combineReducers = (reducers) => {
    return (state = {}, action) => {
        let keys = Object.keys(reducers);
        let hasChanged = false;
        let nextState = {};
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            const reducer = reducers[key];
            const previousStateForKey = state[key];
            const nextStateForKey = reducer(previousStateForKey, action);
            nextState[key] = nextStateForKey;
            hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
        }
        return hasChanged ? nextState : state
    };
}

const isPromise = (val) => {
    return val && typeof val.then === 'function';
}

const toObservable = (action) => {
    if (isPromise(action)) {
        return Rx.Observable.fromPromise(action);
    } else {
        if (typeof action.preload !== 'undefined') {
            if (isPromise(action.preload)) {
                const source = Rx.Observable.fromPromise(action.preload);
                return Object.assign(action, { preload: source })
            } else if (!action.preload instanceof Rx.Observable) {
                const source = Rx.Observable.from(action.preload);
                return Object.assign(action, { preload: source })
            }
        }
    }
    return action;
}

export const dispatch = (action) => {
    if (typeof action === 'undefined') throw Error('action cannot be null or undefined');
    const finalAction = toObservable(action);

    if(finalAction instanceof Rx.Observable) {
        finalAction.subscribe({
            next: (val) => dispatch(val)
        })
    } else if(finalAction.preload instanceof Rx.Observable){
        finalAction.preload.subscribe({
            next: (val) => dispatch(val)
        })
    } else {
        subj.next(action)
    }
}
