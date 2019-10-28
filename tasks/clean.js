const gulp = require('../').gulp(),
  conf = require('./conf'),
  del = require('del');

gulp.task('clean', function () {
  return del(['dist/']);
});

gulp.task('clean-cache', function () {
  return del(conf.CACHE_DIR_NAME);
});

gulp.task('clean-bundle', function () {
  return del(['dist/**/__tests__/', 'dist/**/*.tpl.html.js']);
});
