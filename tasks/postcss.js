const gulp = require('../').gulp(),
  lazyTasks = require('./lazy-tasks');

gulp.task('postcss', function () {
  return gulp
    .src(
      [
        'build/**/*.css'
      ]
    )
    .pipe(lazyTasks.lazyPostcssTask())
    .pipe(gulp.dest('build'));
});
