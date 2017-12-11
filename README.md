Rx Simple State
===============
> Simple Redux like state management library based on RxJs. Fully support Promise and React.

## Installation
```sh
npm install --save rx-simple-state
```

## Quick Start
```js
// create reducer
const AuthReducer(state = {
    authed: false,
}, action) => {
    switch (action.type) {
        case "LOGIN_REQUEST_SUCCESS": {
            return Object.assign(state, { authed: true})
        }
    }
    return state;
}

// combine reducers
import { combineReducers } from 'rx-simple-state';
const combinedReducer = combineReducers({
    auth: AuthReducer
})

// create store
const store = createStore(combinedReducer);

// connect
import { connect } from 'rx-simple-state';
connect((storeState) => {
    // update component's state here
})

// connect to React Component
import React from 'react';
import { connectReact } from 'rx-simple-state';
class Main extends React.Component {
        render = () => (
            <div>
                {this.props.authed?
                <h1>Hi React</h1>:
                <button>Login</button>}
            </div>
        )
}
// just like react redux
const mapStateToProps = (state) => ({
    authed: state.auth.authed
});
export default connectReact(React, Main, mapStateToProps);

//dispatch normal action
import { dispatch } from 'rx-simple-state';
const loginSuccess = (data) => {
    return {
        type: 'LOGIN_REQUEST_SUCCESS',
        preload: data
    }
}
dispatch(loginSuccess('user name'));

//dispatch action with promise preload
export const login = () => {
    return {
        type: 'LOGIN_REQUEST_PENDING',
        preload: new Promise((resolve) => {
            resolve('my username');
        }).then((username) => {
            return loginSuccess(username);
        })
    }
}
// TODO: example of dispatching promise

// TODO: example of Observable preload

```

## TODO
* Support Wechat Mini Program
* Test
* Custom middleware

## References
* [RxState](https://github.com/yamalight/rxstate)
* [Redux Promise](https://github.com/acdlite/redux-promise)
* [React Redux](https://github.com/reactjs/react-redux)

## License

[MIT](http://www.opensource.org/licenses/mit-license)