

Rx Simple State
===============
> Biblioteca de gestión de estado simple similar a Redux, basada en RxJs. Soporta completamente Promise y React.

## Instalación
```sh
npm install --save rx-simple-state
```

## Inicio Rápido
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

## MiniProgram de Wechat - 微信小程序
Los MiniPrograms de Wechat no son compatibles con npm, por lo que es necesario importar RxJs manualmente.

### Importar librería de RxJs - 导入 RxJs 依赖
Copia el archivo ```Rx.5.5.5.min.js``` de la carpeta **wx** al directorio del MiniProgram.

La librería Rx original no se puede importar correctamente en MiniProgram. A este archivo se le ha añadido un fragmento de código al inicio:
```js
var window={Object,setTimeout,clearTimeout};window.window = window;
```

### Instalación - 安装
Copia `lib/state.js` al directorio del MiniProgram.

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

### Inicializar contexto de RxJs - 初始化 RxJx 环境
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

## Tareas Pendientes
* Pruebas
* Middleware personalizado

## Referencias
* [RxState](https://github.com/yamalight/rxstate)
* [Redux Promise](https://github.com/acdlite/redux-promise)
* [React Redux](https://github.com/reactjs/react-redux)

## Licencia

[MIT](http://www.opensource.org/licenses/mit-license)
