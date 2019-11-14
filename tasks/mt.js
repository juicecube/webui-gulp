const path = require('path'),
  gulp = require('../').gulp(),
  mt2amd = require('gulp-mt2amd'),
  cache = require('./cache'),
  util = require('./util');

gulp.task('mt', function () {
  return gulp
    .src(
      [
        'src/common/**/*.tpl.html',
        util.getWorkingDir('src') + '/**/*.tpl.html'
      ],
      {base: path.resolve('src')}
    )
    .pipe(
      cache('mt', 'src', function () {
        return mt2amd({
          strictMode: true,
          commonjs: true,
          babel: util.babel
        });
      })
    )
    .pipe(gulp.dest('www/build/tpl'));
});
