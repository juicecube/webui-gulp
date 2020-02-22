const gulp = require('../').gulp(),
  sus = require('gulp-sus');

gulp.task('sus', function () {
  return gulp
    .src(
      [
        'build/**/*.css'
      ]
    )
    .pipe(
      sus({
        basePath: 'build',
        maxSize: 2 * 1000,
        match: function (p) {
          const m = p.match(/(.+)\?data$/);
          return m && m[1];
        }
      })
    )
    .pipe(gulp.dest('build'));
});
