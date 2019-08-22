# axios-last

[![NPM version][npm-image]][npm-url]
![][travis-url]
![][david-url]
![][dt-url]
![][license-url]

Solution for taking the last value from multiple calls

## Install

### yarn

```bash
yarn add axios-last
```

### npm

```bash
npm install --save axios-last
```

## Import

### ES2015

```javascript
import { create } from 'axios-last'
```

### CommonJS

```javascript
const { create } = require('axios-last')
```

## Usage

```javascript
import { create } from 'axios-last'

const request = create()

for (let i = 0; i < 3; i++) {
  request({
    method: 'GET',
    url: 'https://test.com/users',
    params: {
      name: i
    }
  }).then(res => {
    // only request with name === 2 received
    // all previous requests were cancelled while subsequent made
  })
}
```

## LICENSE

[MIT License](https://raw.githubusercontent.com/leftstick/axios-last/master/LICENSE)

[npm-url]: https://npmjs.org/package/axios-last
[npm-image]: https://badge.fury.io/js/axios-last.png
[travis-url]: https://api.travis-ci.com/leftstick/axios-last.svg?branch=master
[david-url]: https://david-dm.org/leftstick/axios-last.png
[dt-url]: https://img.shields.io/npm/dt/axios-last.svg
[license-url]: https://img.shields.io/npm/l/axios-last.svg
