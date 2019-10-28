const gulp = require('../').gulp(),
  mt2amd = require('gulp-mt2amd'),
  cache = require('./cache'),
  util = require('./util');

// compile micro template
gulp.task('mt:tpl', function () {
  return gulp
    .src(
      util.appendSrcExclusion(['src/**/*.tpl.html'])
    )
    .pipe(
      cache('mt', 'src', function () {
        return mt2amd({
          strictMode: true,
          babel: util.babel
        });
      })
    )
    .pipe(gulp.dest('dist'));
});

// mt
gulp.task('mt', ['mt:tpl']);
