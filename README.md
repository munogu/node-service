# Node service

Cross-platform service management tool for Node.js

It uses [launchd][launchd-url] on `darwin`, [systemd][systemd-url] on `linux` and [nssm.exe][nssm-url] for `win32`.

[![Standard - JavaScript Style Guide][standard-badge]][standard-url]

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API](#api)
- [Debugging](#debugging)

## Requirements

* Administrative privileges
* [Node.js][node-url] >= 6.0

## Installation

```
$ npm install @munogu/service
```

## Quick Start

```javascript
// module dependencies
const Service = require('@munogu/service')

// initialize service
let service = new Service({
  name: 'my-service',
  description: 'My awesome service',
  argv: ['node', 'index.js']
})

// install service
service.install()
console.log('service installed')
```

## API

### Service(options = object)

```javascript
new Service({
  // machine readable alphanumeric service name
  name: 'my-service',
  // service description
  description: 'My awesome service',
  // service entry argv
  argv: ['node', 'index.js']
})
console.log('Service installed & started')
```

### Service.install() - void

```javascript
service.install()
console.log('Service installed & started')
```

### Service.uninstall() - void

```javascript
service.uninstall()
console.log('Service is disabled & uninstalled')
```

### Service.status() - Boolean

Returns service status. `true` if running, `false` if not.

```javascript
if (service.status()) {
  console.log('service is running')
} else {
  console.log('service is NOT running')
}
```

## Debugging

Node service along with many of the libraries it's built with support the **DEBUG** environment variable from [debug][debug-url] which provides simple conditional logging.

For example to see all `service` specific debugging information just pass `DEBUG=service*` and upon boot you'll see the list of middleware used, among other things.

[standard-badge]: https://cdn.rawgit.com/feross/standard/master/badge.svg "Standard - JavaScript Style Guide"
[standard-url]: https://github.com/feross/standard
[launchd-url]: https://en.wikipedia.org/wiki/Launchd
[systemd-url]: https://en.wikipedia.org/wiki/Systemd
[nssm-url]: https://nssm.cc
[node-url]: https://nodejs.org
[debug-url]: https://github.com/visionmedia/debug