# sock-client-stomp

[![NPM version][npm-image]][npm-url]
![][david-url]
![][dt-url]
![][license-url]


## Deprecated

Do not use it any more. Please refer to [socket.io.client.biz](https://github.com/DFocusGroup/socket.io.client.biz) instead


Project based high level abstraction of SSP.

`sock-client-stomp` is made for domain specific business scenarios. It consists of following features:

- re-connect
- authentication by token
- project based, let's say you are working on a SaaS platform, several projects may watch for SSP individually
- easy to subscribe messages for current user
- easy to subscribe broadcast messages
- no need to worry about re-subscribe process whenever re-connect triggered

## Install

### yarn

```bash
yarn add sock-client-stomp
```

### npm

```bash
npm install --save sock-client-stomp
```

## Import

### ES2015

```javascript
import { SockClient } from 'sock-client-stomp'
```

### CommonJS

```javascript
const { SockClient } = require('sock-client-stomp')
```

## Usage

```javascript
import { SockClient } from 'sock-client-stomp'

const socket = new SockClient({
  base: 'http://demo.ssp.com/msg-center/websocket',
  token: 'your token for authentication',
  projectId: 'project you are going to watch',
  // set to false to disable reconnect feature
  reconnect: {
    timeout: 30 * 1000
  }
})

// watch every connection state change
socket.onStateChange(state => {
  console.log('state changed to', state)
})

// subscribe broadcast info
socket.subscribeBroadcast('topic your are going to watch', arg => {
  console.log(arg)
})

// connect
socket.connect()
```

## LICENSE

[MIT License](https://raw.githubusercontent.com/DFocusFE/sock-client-stomp/master/LICENSE)

[npm-url]: https://npmjs.org/package/sock-client-stomp
[npm-image]: https://badge.fury.io/js/sock-client-stomp.png
[david-url]: https://david-dm.org/DFocusFE/sock-client-stomp.png
[dt-url]: https://img.shields.io/npm/dt/sock-client-stomp.svg
[license-url]: https://img.shields.io/npm/l/sock-client-stomp.svg
