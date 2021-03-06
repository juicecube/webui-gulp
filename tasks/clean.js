const gulp = require('../').gulp(),
  conf = require('./conf'),
  del = require('del');

gulp.task('clean:build', function() {
  return del(['build/', 'www/build/']);
});

gulp.task('clean:cache', function() {
  return del(conf.CACHE_DIR_NAME);
});

gulp.task('clean:bundle', function() {
  const src = ['build/**/__tests__/', 'build/**/*.html'];
  return del(src);
});
