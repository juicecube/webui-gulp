const gulp = require('../').gulp(),
  babel = require('gulp-babel'),
  sourcemaps = require('gulp-sourcemaps');

gulp.task('babel', function() {
  return gulp
    .src(['build/**/*.js', '!**/_vendor/**/*'])
    .pipe(
      sourcemaps.init({
        loadMaps: true,
      }),
    )
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build'));
});
