const path = require('path'),
  spawn = require('child_process').spawn,
  gulp = require('../').gulp(),
  util = require('./util'),
  mt2amd = require('gulp-mt2amd');

gulp.task('server:ts', function (done) {
  const ps = spawn('npx', ['tsc', '--outDir', 'www/build', '--project', 'www/tsconfig.json', '--skipLibCheck'], {stdio: 'inherit'});
  ps.on('close', function (code) {
    done(code === 0 ? null : new Error('server:ts failed'));
  });
});

gulp.task('server:tpl', function () {
  return gulp
    .src(
      [
        util.getWorkingDir('build') + '/**/*.html'
      ],
      {base: path.resolve('build')}
    )
    .pipe(mt2amd({
      strictMode: true,
      commonjs: true,
      dataInjection: 'G.SERVER_INJECTED_DATA',
      babel: util.babel
    }))
    .pipe(gulp.dest('www/build/tpl'));
});
