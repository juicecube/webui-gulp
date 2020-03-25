const path = require('path'),
  gulp = require('../').gulp(),
  util = require('./util'),
  lazyTasks = require('./lazy-tasks');

gulp.task('postcss', function() {
  return gulp
    .src([util.getWorkingDir('build') + '/**/*.css'], { base: path.resolve('build') })
    .pipe(lazyTasks.lazyPostcssTask())
    .pipe(gulp.dest('build'));
});
