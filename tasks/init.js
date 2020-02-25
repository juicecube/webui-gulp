const gulp = require('../').gulp();

gulp.task('copy', function() {
  return gulp
    .src([
      'src/robots.txt',
      'src/**/*.+(jpg|jpeg|gif|png|otf|eot|svg|ttf|woff|woff2|ico|mp3|swf)',
      'src/**/_vendor/**/**',
      '!src/**/*.+(less|scss)',
    ])
    .pipe(gulp.dest('build'));
});

gulp.task('init', ['copy', 'mt']);
