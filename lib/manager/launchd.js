// debugger
const debug = require('debug')('service:launchd')

// module dependencies
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const Service = require('../service')

// launchd support - darwin
class Launchd extends Service {
  get output () {
    return `/Library/LaunchDaemons/com.munogu.${this.options.name}.plist`
  }
  template () {
    let dir = path.dirname(process.argv[process.env.ENCLOSE ? 0 : 1])
    return `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <dict>
      <key>EnvironmentVariables</key>
      <dict>
        <key>NODE_SERVICE</key>
        <string>launchd</string>
      </dict>
      <key>Label</key>
      <string>com.munogu.${this.options.name}</string>
      <key>UserName</key>
      <string>root</string>
      <key>ProgramArguments</key>
      <array>
        ${this.options.argv.map((argv, index) => {
          return [
            index > 0 ? '        ' : '',
            `<string>${argv}</string>`
          ].join('')
        }).join('\n')}
      </array>
      <key>WorkingDirectory</key>
      <string>${dir}</string>
      <key>StandardOutPath</key>
      <string>/var/log/${this.options.name}-out.log</string>
      <key>StandardErrorPath</key>
      <string>/var/log/${this.options.name}-err.log</string>
      <key>Debug</key>
      <true/>
      <key>KeepAlive</key>
      <true/>
    </dict>
    </plist>`.replace(/^    /gm, '')
  }
  start () {
    // load service
    return execSync(`launchctl load -w ${this.output}`, {
      windowsHide: true,
      stdio: []
    })
  }
  static get manager () {
    return 'launchd'
  }
  static supported () {
    try {
      execSync('launchctl version', {
        windowsHide: true,
        stdio: []
      })
      return true
    } catch (e) {
      return false
    }
  }
  install () {
    if (fs.existsSync(this.output)) {
      debug('service exists')
      let plist = fs.readFileSync(this.output, 'utf-8')
      if (plist.indexOf('>' + process.argv[0] + '<') === -1) {
        execSync(`launchctl unload ${this.output}`, {
          windowsHide: true,
          stdio: []
        })
        debug('service unloaded')
      }
    } else {
      debug('service does not exists')
    }
    // write configuration file
    fs.writeFileSync(this.output, this.template())
    debug('service file written')
    // start service
    this.start()
    debug('service started')
  }
  uninstall () {
    execSync(`launchctl unload ${this.output}`, {
      windowsHide: true,
      stdio: []
    })
  }
  status () {
    try {
      execSync(`launchctl list com.munogu.${this.options.name}`, {
        windowsHide: true,
        stdio: []
      })
      return true
    } catch (err) {
      if (err.message.indexOf('Could not find service') === -1) {
        throw err
      } else {
        return false
      }
    }
  }
}

exports = module.exports = Launchd