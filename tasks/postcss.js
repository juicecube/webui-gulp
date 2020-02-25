const gulp = require('../').gulp(),
  util = require('./util'),
  lazyTasks = require('./lazy-tasks');

gulp.task('postcss', function() {
  return gulp
    .src([util.getWorkingDir('build') + '/**/*.css'])
    .pipe(lazyTasks.lazyPostcssTask())
    .pipe(gulp.dest('build'));
});
