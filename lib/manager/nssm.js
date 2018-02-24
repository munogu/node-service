// debugger
const debug = require('debug')('service:nssm')

// module dependencies
const path = require('path')
const { execSync } = require('child_process')
const Service = require('../service')

// nssm.exe support - win32
class Nssm extends Service {
  get nssm () {
    let name = process.arch === 'x64' ? 'nssm64.exe' : 'nssm32.exe'
    return path.join(__dirname, '../../bin', name)
  }
  static get manager () {
    return 'nssm'
  }
  static supported () {
    try {
      execSync(`${this.nssm} --help`, {
        windowsHide: true,
        stdio: []
      })
      return true
    } catch (e) {
      return false
    }
  }
  install () {
    let exists
    try {
      execSync(`${this.nssm} status ${this.options.name}`, {
        windowsHide: true,
        stdio: []
      })
      this.uninstall()
      exists = true
    } catch (err) {
      exists = false
    }

    // install service
    let bin = this.options.argv[0]
    execSync([
      this.nssm,
      'install',
      this.options.name,
      `"${bin}"`
    ].join(' '), {
      windowsHide: true,
      windowsVerbatimArguments: true,
      stdio: []
    })

    // set an application data directory
    let name = Service.humanize(this.options.name)
    let datadir = path.join('%SystemDrive%', 'ProgramData', name)
    let logdir = path.join(datadir, 'Logs')
    try {
      execSync(`mkdir "${logdir}"`, {
        windowsHide: true,
        stdio: []
      })
    } catch (err) {
      // ignore already exists errors
      if (err.stderr && err.stderr.indexOf('already exists') === -1) {
        throw err
      }
    }

    // set service params
    let set = (key, ...vals) => {
      execSync([
        this.nssm,
        'set',
        this.options.name,
        key,
        vals.map(val => {
          if (typeof val === 'string' && val.match(/\s/)) {
            return `"${val}"`
          } else {
            return val
          }
        }).join(' ')
      ].join(' '), {
        windowsHide: true,
        stdio: []
      })
    }
    set('AppDirectory', path.dirname(bin))
    set('AppParameters', this.options.argv.slice(1).join(' '))
    set('Description', this.options.description)
    set('DisplayName', name)
    set('start', 'SERVICE_AUTO_START')
    set('ObjectName', 'LocalSystem')
    set('Type', 'SERVICE_WIN32_OWN_PROCESS')
    set('AppNoConsole', 0)
    set('AppThrottle', 1500)
    set('AppExit', 'Default', 'Restart')
    set('AppRestartDelay', 10)
    set('AppEnvironmentExtra', 'NODE_SERVICE=nssm')
    set('AppStdoutCreationDisposition', 2)
    set('AppStderrCreationDisposition', 2)
    set('AppRotateFiles', 1)
    set('AppRotateOnline', 1)
    set('AppRotateSeconds', 86400)
    set('AppRotateBytes', 5 * 1024 * 1024)
    set('AppStdout', path.join(logdir, 'Logs', 'out.log'))
    set('AppStderr', path.join(logdir, 'Logs', 'err.log'))

    // restart
    execSync(`${this.nssm} restart ${this.options.name}`, {
      windowsHide: true,
      stdio: []
    })
  }
  uninstall () {
    try {
      execSync(`${this.nssm} stop ${this.options.name}`, {
        windowsHide: true,
        stdio: []
      })
    } catch (err) {}
    execSync(`${this.nssm} remove ${this.options.name} confirm`, {
      windowsHide: true,
      stdio: []
    })
  }
  status () {
    try {
      let out = execSync(`${this.nssm} status ${this.options.name}`, {
        windowsHide: true,
        stdio: []
      })
      if (out.toString().indexOf('SERVICE_RUNNING') > -1) {
        return true
      } else {
        return false
      }
    } catch (err) {
      return false
    }
  }
}

exports = module.exports = Nssm