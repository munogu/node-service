// abstract service class
class Service {
  constructor (options = {}) {
    // add default options
    this.options = Object.assign({}, {
      name: 'my-service',
      description: 'My awesome service',
      argv: process.argv,
    }, options)
  }
  static humanize(str) {
    return str
      .replace(/^[\s_-]+|[\s_-]+$/g, '')
      .replace(/[_-\s]+/g, ' ')
      .split(' ').map(s => s.replace(/^[a-z]/, m => m.toUpperCase())).join(' ')
  }
}

exports = module.exports = Service