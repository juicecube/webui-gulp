const spawn = require('child_process').spawn,
  gulp = require('../').gulp(),
  conf = require('./conf'),
  runSequence = require('run-sequence').use(gulp);

gulp.task('start', function (done) {
  runSequence('clean:build', 'copy', 'bundle', 'server:ts', 'server:tpl', 'clean:bundle', function (err) {
    done(err);
    if (!err) {
      let server = spawn('node', [`--inspect=127.0.0.1:${conf.debugPort || 9229}`, 'www/build/app.js'], {stdio: 'inherit'});
      let startTime = Date.now();
      let toRef;
      function restart() {
        if (Date.now() - startTime < 3000) {
          return;
        }
        clearTimeout(toRef);
        toRef = setTimeout(function () {
          server.kill();
          server = spawn('node', [`--inspect=127.0.0.1:${conf.debugPort || 9229}`, 'www/build/app.js'], {stdio: 'inherit'});
          startTime = Date.now();
          console.log(`Development server restarted ...`);
        }, 300);
      }
      gulp.watch(['src/**/*', 'types/**/*'], function (evt) {
          console.log('[changed] ' + evt.path);
          runSequence('copy', 'bundle', 'server:tpl', 'clean:bundle', function (err) {
            if (err) {
              console.log(err);
              return;
            }
            restart();
          });
      });
      gulp.watch(['www/src/**/*', 'www/types/**/*'], function (evt) {
          console.log('[changed] ' + evt.path);
          runSequence('server:ts', function (err) {
            if (err) {
              console.log(err);
              return;
            }
            restart();
          });
      });
      console.log(`Development server listening on http://127.0.0.1:${conf.serverPort} ...`);
    }
  });
});

gulp.task('build', function (done) {
  runSequence(
    'clean:build',
    'copy',
    'imagemin',
    'bundle',
    'versioning:asset',
    'versioning:html',
    'versioning:clean',
    'server:ts',
    'server:tpl',
    'minify',
    'clean:bundle',
    function (err) {
      done(err);
    }
  );
});
