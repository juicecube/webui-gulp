const path = require('path'),
  spawn = require('child_process').spawn,
  gulp = require('../').gulp(),
  conf = require('./conf'),
  log = require('fancy-log'),
  chalk = require('chalk'),
  runSequence = require('run-sequence').use(gulp);

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
            logLine();
            logChanged(evt.path);
            runSequence('bundle:asset', 'postcss', 'sprite:img', 'sprite:css', function(err) {
              if (err) {
                console.error(err);
                return;
              }
              log('Done');
              logLine();
              logListening();
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
            logLine();
            logChanged(evt.path);
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
                if (err) {
                  console.error(err);
                  return;
                }
                restart();
              },
            );
          },
        );
        gulp.watch(['www/src/**/*'], function(evt) {
          logLine();
          logChanged(evt.path);
          runSequence('server:tsc', function(err) {
            if (err) {
              console.error(err);
              return;
            }
            restart();
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
