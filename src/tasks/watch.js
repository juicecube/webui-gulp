const fs = require('fs')
const path = require('path')
const { spawn, execFile } = require('child_process')
const log = require('fancy-log')
const chalk = require('chalk')
const DefaultRegistry = require('undertaker-registry')
const conf = require('../utils/conf')
const util = require('../utils/util')
const { startLiveReloadServer } = require('../utils/live-reload')

let currentTask
const execQueue = []

function checkExecQueue() {
  if (!execQueue.length || currentTask) {
    return
  }
  currentTask = execQueue.shift()
  const filePath = path.relative(process.cwd(), currentTask.path)
  util.changeWorkingDir(filePath.indexOf('src/common/') === 0 ? '/' : conf.WORKING_DIR)
  currentTask.exec(function (needRestart) {
    setTimeout(
      function () {
        execFile(
          'curl',
          [`http://127.0.0.1:9981/?source=${filePath}`, '-H', "'Pragma: no-cache'", '-H', "'Cache-Control: no-cache'"],
          function () {}
        )
        currentTask = null
        checkExecQueue()
      },
      needRestart ? 500 : 0
    )
  })
}

function enqueue(filePath, taskFun) {
  const digest = util.getDigest(fs.readFileSync(filePath).toString())
  if (
    (currentTask && currentTask.path === filePath && currentTask.digest === digest) ||
    execQueue.some(function (task) {
      return task.path === filePath && task.digest === digest
    })
  ) {
    return
  }
  execQueue.push({
    digest: digest,
    path: filePath,
    exec: taskFun,
  })
  checkExecQueue()
}

function logLine() {
  log('------------------------------------------------------------------------')
}

function logListening() {
  const addrs = [`http://127.0.0.1:${conf.serverPort}`]
  const lanIp = util.getLanIp()
  if (lanIp) {
    addrs.push(`http://${lanIp}:${conf.serverPort}`)
  }
  console.log(`Development server listening on ${addrs.join(' ')} ...`)
}

function logChanged(filePath) {
  log("Changed  '" + chalk.green(path.relative(process.cwd(), filePath)) + "'")
}

class WatchTask extends DefaultRegistry {
  init(gulp) {
    gulp.task('watch', function () {
      startLiveReloadServer()

      let server = spawn('node', [`--inspect=127.0.0.1:${conf.debugPort || 9229}`, 'www/build/app.js'], {
        stdio: 'inherit',
      })
      let startTime = Date.now()
      let toRef
      function restart() {
        if (Date.now() - startTime < 3000) {
          return
        }
        clearTimeout(toRef)
        toRef = setTimeout(function () {
          server.kill()
          server = spawn('node', [`--inspect=127.0.0.1:${conf.debugPort || 9229}`, 'www/build/app.js'], {
            stdio: 'inherit',
          })
          startTime = Date.now()
          log('Done')
          logLine()
          logListening()
        }, 300)
      }

      util.changeWorkingDir(conf.WORKING_DIR)

      gulp
        .watch([
          util.getWorkingDir('src') + '/**/*.+(ts|tsx|js|jsx|vue|scss)',
          'src/common/**/*.+(ts|tsx|js|jsx|vue|scss)',
          '!src/common/includes/**/*',
          '!src/common/layouts/**/*',
          '!src/**/*.inc.+(ts|js)',
          '!src/**/_vendor/**/**',
        ])
        .on('change', function (path, stats) {
          // const filePath = evt.path
          // if (evt.type !== 'changed') {
          //   return
          // }
          enqueue(path, function execTask(cb) {
            logLine()
            logChanged(path)
            gulp.series('bundle:asset', 'postcss', 'sprite:img', 'sprite:css', function (err) {
              cb && cb()
              if (err) {
                console.error(err)
                return
              }
              log('Done')
              logLine()
              logListening()
            })()
          })
        })

      gulp
        .watch([
          util.getWorkingDir('src') + '/**/*.html',
          util.getWorkingDir('src') + '/**/*.inc.+(ts|js)',
          util.getWorkingDir('src') + '/**/*.+(jpg|jpeg|gif|png|otf|eot|svg|ttf|woff|woff2|ico|mp3|swf)',
          util.getWorkingDir('src') + '/**/_vendor/**/**',
          'src/common/includes/**/*',
          'src/common/layouts/**/*',
        ])
        .on('change', function (path, stats) {
          // const filePath = evt.path
          // if (evt.type !== 'changed') {
          //   return
          // }
          enqueue(path, function execTask(cb) {
            logLine()
            logChanged(path)
            gulp.series(
              'init',
              'bundle:asset',
              'postcss',
              'sprite:img',
              'sprite:css',
              'bundle:html',
              'server:tpl',
              'clean:bundle',
              function (err) {
                cb && cb(true)
                if (err) {
                  console.error(err)
                  return
                }
                restart()
              }
            )()
          })
        })

      gulp.watch(['www/src/**/*']).on('change', function (path) {
        // const filePath = evt.path
        // if (evt.type !== 'changed') {
        //   return
        // }
        enqueue(path, function execTask(cb) {
          logLine()
          logChanged(path)
          gulp.series('server:tsc', function (err) {
            cb && cb(true)
            if (err) {
              console.error(err)
              return
            }
            restart()
          })()
        })
      })

      logListening()
    })
  }
}

module.exports = WatchTask
