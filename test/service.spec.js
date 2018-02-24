// module dependencies
const { assert, expect } = require('chai')
const path = require('path')

function cache () {
  // delete require cache
  delete require.cache[require.resolve('../index')]
  delete require.cache[require.resolve('../lib/service')]
  delete require.cache[require.resolve('../lib/manager/launchd')]
  delete require.cache[require.resolve('../lib/manager/systemd')]
  delete require.cache[require.resolve('../lib/manager/nssm')]
}

// describe test
describe('service', function () {
  describe('default platform', function () {
    const Service = require('../index')
    it('check options', function () {
      let options = {
        name: 'my-service',
        description: 'My awesome service',
        argv: ['hello', 'world']
      }
      let service = new Service(options)
      assert.equal(service.options.name, options.name)
      assert.equal(service.options.description, options.description)
      assert.equal(service.options.argv, options.argv)
    })
    it('check methods', function () {
      let service = new Service()
      assert.isFunction(service.install)
      assert.isFunction(service.uninstall)
      assert.isFunction(service.status)
      assert.isString(Service.manager)
    })
    it('default options', function () {
      let service = new Service()
      assert.include(service.options.argv, process.argv[0])
      assert.include(service.options.argv, process.argv[1])
    })
    it('humanize string', function () {
      assert.equal(Service.humanize('my-service'), 'My Service')
    })
    it('check inexisting status', function () {
      let service = new Service()
      assert.isFalse(service.status())
    })
    describe('install & uninstall', () => {
      let service
      before(() => {
        service = new Service({
          name: 'node-service-test',
          description: 'Test Service',
          argv: [process.argv[0], path.join(__dirname, 'demo.js')]
        })
      }) 
      it('install new', function (cb) {
        service.install()
        setTimeout(() => {
          cb()
        }, 1000)
      })
      it('status', function (cb) {
        setTimeout(() => {
          assert.isTrue(service.status())
          cb()
        }, 1000)
      })
      it('install exists', function (cb) {
        service.install()
        setTimeout(() => {
          cb()
        }, 1000)
      })
      it('uninstall', function () {
        service.uninstall()
      })
    })
  })
  const platforms = ['darwin', 'linux', 'win32']
  platforms.forEach(platform => {
    // create test
    describe(platform,  () => {
      it((platform === process.platform ? '' : 'un') + 'supported', () => {
        let loaded
        // delete require cache
        cache()
        // mock platform
        process.env.PLATFORM = platform
        // load service
        try {
          const Service = require('../index')
          let service = new Service()
          loaded = true
        } catch (err) {
          loaded = false
        }
        if (platform === process.platform) {
          assert.isTrue(loaded)
        } else {
          assert.isFalse(loaded)
        }
      })
    })
    // switch back to default platform
    process.env.PLATFORM = process.platform
  })
  describe('unknown platform', function () {
    it ('android throws error', () => {
      // delete require cache
      cache()
      // switch back to default platform
      process.env.PLATFORM = 'android'
      // load service
      expect(() => require('../index')).to.throw()
    })
    // switch back to default platform
    process.env.PLATFORM = process.platform
  })
  if (process.platform !== 'darwin') {
    describe('cross platform darwin', () => {
      it ('status check', () => {
        // delete require cache
        cache()
        // initialize service
        let service = new require('../lib/manager/launchd')()
        assert.isFalse(service.status())
      })
    })
  }
  if (process.platform !== 'linux') {
    describe('cross platform linux', () => {
      it ('status check', () => {
        // delete require cache
        cache()
        // initialize service
        let Systemd = require('../lib/manager/systemd')
        let service = new Systemd()
        expect(() => service.status()).to.throw()
      })
    })
  }
})