const gulp = require('../').gulp(),
  mt2amd = require('gulp-mt2amd'),
  cache = require('./cache'),
  util = require('./util');

gulp.task('mt', function () {
  return gulp
    .src(
      ['src/**/*.tpl.html']
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
