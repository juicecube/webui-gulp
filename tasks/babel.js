const gulp = require('../').gulp(),
  babel = require('gulp-babel');

gulp.task('babel', function() {
  return gulp
    .src(['build/**/*.js', '!**/_vendor/**/*'])
    .pipe(babel())
    .pipe(gulp.dest('build'));
});
