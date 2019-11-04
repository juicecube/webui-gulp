const gulp = require('../').gulp(),
  conf = require('./conf');

gulp.task('vendor', function (done) {
  return gulp
    .src([
      'src/**/_vendor/**/**',
      '!src/**/*.+(less|scss)'
    ])
    .pipe(gulp.dest('build'));
});
