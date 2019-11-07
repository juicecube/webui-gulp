const gulp = require('../').gulp(),
  mt2amd = require('gulp-mt2amd'),
  cache = require('./cache'),
  util = require('./util');

// compile micro template
gulp.task('mt:tpl', function () {
  return gulp
    .src(
      ['src/**/*.tpl.html']
    )
    .pipe(
      cache('mt', 'src', function () {
        return mt2amd({
          strictMode: true,
          commonjs: true,
          dataInjection: 'G.SERVER_INJECTED_DATA',
          babel: util.babel
        });
      })
    )
    .pipe(gulp.dest('www/build'));
});

// mt
gulp.task('mt', ['mt:tpl']);
