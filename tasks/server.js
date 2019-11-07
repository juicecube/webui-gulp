const path = require('path'),
  gulp = require('../').gulp(),
  util = require('./util'),
  mt2amd = require('gulp-mt2amd');

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
    .pipe(gulp.dest('www/build'));
});
