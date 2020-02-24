const gulp = require('../').gulp(),
  sus = require('gulp-sus');

gulp.task('sus', function() {
  return gulp
    .src(['build/**/*.css'])
    .pipe(
      sus({
        baseDir: 'build',
        match: function(p) {
          const m = p.match(/(.+)\?data$/);
          return m && m[1];
        },
      }),
    )
    .pipe(gulp.dest('build'));
});
