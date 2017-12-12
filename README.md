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

## Wechat Mini Program - 微信小程序
微信小程序不支持npm，因此需要手动导入Rxjs

### Import RxJs lib - 导入 RxJs 依赖
复制**wx**文件夹下的```Rx.5.5.5.min.js```到小程序目录下

原始的Rx无法顺利导入小程序，此文件在头部添加了一段代码
```js
var window={Object,setTimeout,clearTimeout};window.window = window;
```

### Installation - 安装
复制 lib/state.js 到小程序目录下

```
wxapp
- app.js
- app.json
- ap.wxss
---- lib
------- Rx.5.5.5.min.js
------- state.js
---- pages
---- utils
```

### Init RxJs context - 初始化 RxJx 环境
```js
//app.js
const Rx = require('./libs/Rx.5.5.5.min.js');
const createRxSimpleState = require('./libs/state.js');
const RxSimpleState = createRxSimpleState(Rx);
App({
    // cache it for quick access from other pages
    rxstate: RxSimpleState
})
//index.js connect to store
const app = getApp();
const pageConfig = {
    data: {},
    onLoad: function() {...},
}
const mapToData = (state) => {
  return({
    userInfo: state.user.userInfo
  })
}
// use connectWxPage
Page(app.rxstate.connectWxPage(pageConfig, mapToData))
```

## TODO
* Test
* Custom middleware

## References
* [RxState](https://github.com/yamalight/rxstate)
* [Redux Promise](https://github.com/acdlite/redux-promise)
* [React Redux](https://github.com/reactjs/react-redux)

## License

[MIT](http://www.opensource.org/licenses/mit-license)