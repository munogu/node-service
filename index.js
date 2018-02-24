// debugger
const debug = require('debug')('service')

// managers
const Launchd = require('./lib/manager/launchd')
const Systemd = require('./lib/manager/systemd')
const Nssm = require('./lib/manager/nssm')

const platform = process.env.PLATFORM || process.platform

let Service
if (platform === 'darwin') {
  Service = Launchd
} else if (platform === 'linux') {
  Service = Systemd
} else if (platform === 'win32') {
  Service = Nssm
} else {
  throw new Error('Unsupported platform ' + platform)
}

// check supported
if (!Service.supported()) {
  throw new Error('Service manager ' + Service.manager + ' not supported')
}

// expose guessed service class
exports = module.exports = Service

// expose individual service managers
exports.Launchd = Launchd
exports.Systemd = Systemd
exports.Nssm = Nssm