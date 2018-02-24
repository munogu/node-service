// debugger
const debug = require('debug')('service:systemd')

// module dependencies
const fs = require('fs')
const { execSync } = require('child_process')
const Service = require('../service')

// systemd support - linux
class Systemd extends Service {
  get output () {
    return `/etc/systemd/system/${this.options.name}.service`
  }
  template () {
    return `## Generated on ${new Date().toISOString()}
    [Unit]
    Description=${this.options.description}
    After=network.target
    After=syslog.target

    [Service]
    Environment="NODE_SERVICE=systemd"
    ExecStart=${[process.argv[0], process.argv[1], 'exec'].join(' ')}
    KillMode=process
    KillSignal=SIGTERM
    Restart=always
    StandardOutput=/var/log/${this.options.name}-out.log
    StandardError=/var/log/${this.options.name}-err.log
    SyslogFacility=daemon
    SyslogLevel=notice
    SyslogIdentifier=kiosk-client

    [Install]
    WantedBy=multi-user.target`.replace(/^    /gm, '')
  }
  static get manager () {
    return 'systemd'
  }
  static supported () {
    try {
      execSync('systemctl --version', {
        windowsHide: true,
        stdio: []
      })
      return true
    } catch (e) {
      return false
    }
  }
  install () {
    // write service
    fs.writeFileSync(this.output, this.template())
    // enable service
    execSync(`systemctl enable ${this.options.name}`, {
      windowsHide: true,
      stdio: []
    })
    // start service
    execSync(`systemctl start ${this.options.name}`, {
      windowsHide: true,
      stdio: []
    })
  }
  uninstall () {
    execSync(`systemctl stop ${this.options.name}`, {
      windowsHide: true,
      stdio: []
    })
    execSync(`systemctl disable ${this.options.name}`, {
      windowsHide: true,
      stdio: []
    })
  }
  status () {
    try {
      let out = execSync(`systemctl is-active ${this.options.name}`, {
        windowsHide: true,
        stdio: []
      })
      return out.toString().replace(/\r?\n|\r/, '') === 'active'
    } catch (err) {
      let out = err.stdout.toString().replace(/\r?\n|\r/, '')
      if (err.status === 3 && out === 'inactive') {
        return false
      } else {
        throw err
      }
    }
  }
}

exports = module.exports = Systemd