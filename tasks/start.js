const fs = require('fs'),
  path = require('path'),
  spawn = require('child_process').spawn,
  gulp = require('../').gulp(),
  conf = require('./conf'),
  util = require('./util'),
  log = require('fancy-log'),
  chalk = require('chalk'),
  runSequence = require('run-sequence').use(gulp);

let currentTask;
const execQueue = [];

function checkExecQueue() {
  if (!execQueue.length || currentTask) {
    return;
  }
  currentTask = execQueue.shift();
  currentTask.exec(function() {
    setTimeout(function() {
      currentTask = null;
      checkExecQueue();
    }, 500);
  });
}

function enqueue(filePath, taskFun) {
  const digest = util.getDigest(fs.readFileSync(filePath).toString());
  if (
    (currentTask && currentTask.path === filePath && currentTask.digest === digest) ||
    execQueue.some(function(task) {
      return task.path === filePath && task.digest === digest;
    })
  ) {
    return;
  }
  execQueue.push({
    digest: digest,
    path: filePath,
    exec: taskFun,
  });
  checkExecQueue();
}

function logLine() {
  log('------------------------------------------------------------------------');
}

function logListening() {
  console.log(`Development server listening on http://127.0.0.1:${conf.serverPort} ...`);
}

function logChanged(filePath) {
  log("Changed  '" + chalk.green(path.relative(process.cwd(), filePath)) + "'");
}

gulp.task('start', function(done) {
  runSequence(
    'clean:build',
    'init',
    'bundle:asset',
    'postcss',
    'sprite:img',
    'sprite:css',
    'bundle:html',
    'server:tsc',
    'server:tpl',
    'clean:bundle',
    function(err) {
      done(err);
      if (!err) {
        let server = spawn('node', [`--inspect=127.0.0.1:${conf.debugPort || 9229}`, 'www/build/app.js'], {
          stdio: 'inherit',
        });
        let startTime = Date.now();
        let toRef;
        function restart() {
          if (Date.now() - startTime < 3000) {
            return;
          }
          clearTimeout(toRef);
          toRef = setTimeout(function() {
            server.kill();
            server = spawn('node', [`--inspect=127.0.0.1:${conf.debugPort || 9229}`, 'www/build/app.js'], {
              stdio: 'inherit',
            });
            startTime = Date.now();
            log('Done');
            logLine();
            logListening();
          }, 300);
        }

        gulp.watch(
          ['src/**/*.+(ts|tsx|js|jsx|vue)', 'src/**/*.+(scss|less)', '!src/**/*.inc.+(ts|js)', '!src/**/_vendor/**/**'],
          function(evt) {
            const filePath = evt.path;
            if (evt.type !== 'changed') {
              return;
            }
            enqueue(filePath, function execTask(cb) {
              logLine();
              logChanged(filePath);
              runSequence('bundle:asset', 'postcss', 'sprite:img', 'sprite:css', function(err) {
                cb && cb();
                if (err) {
                  console.error(err);
                  return;
                }
                log('Done');
                logLine();
                logListening();
              });
            });
          },
        );

        gulp.watch(
          [
            'src/**/*.html',
            'src/**/*.inc.+(ts|js)',
            'src/**/*.+(jpg|jpeg|gif|png|otf|eot|svg|ttf|woff|woff2|ico|mp3|swf)',
            'src/**/_vendor/**/**',
          ],
          function(evt) {
            const filePath = evt.path;
            if (evt.type !== 'changed') {
              return;
            }
            enqueue(filePath, function execTask(cb) {
              logLine();
              logChanged(filePath);
              runSequence(
                'init',
                'bundle:asset',
                'postcss',
                'sprite:img',
                'sprite:css',
                'bundle:html',
                'server:tpl',
                'clean:bundle',
                function(err) {
                  cb && cb();
                  if (err) {
                    console.error(err);
                    return;
                  }
                  restart();
                },
              );
            });
          },
        );

        gulp.watch(['www/src/**/*'], function(evt) {
          const filePath = evt.path;
          if (evt.type !== 'changed') {
            return;
          }
          enqueue(filePath, function execTask(cb) {
            logLine();
            logChanged(filePath);
            runSequence('server:tsc', function(err) {
              cb && cb();
              if (err) {
                console.error(err);
                return;
              }
              restart();
            });
          });
        });

        logListening();
      }
    },
  );
});

gulp.task('build', function(done) {
  runSequence(
    'clean:build',
    'init',
    'imagemin',
    'bundle:asset',
    'postcss',
    'sus',
    'sprite:img',
    'sprite:css',
    'versioning:asset',
    'bundle:html',
    'versioning:html',
    'versioning:clean',
    'server:tsc',
    'server:tpl',
    'minify',
    'clean:bundle',
    function(err) {
      done(err);
    },
  );
});
