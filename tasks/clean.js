const gulp = require('../').gulp(),
  conf = require('./conf'),
  del = require('del');

gulp.task('clean', function () {
  return del(['build/']);
});

gulp.task('clean-cache', function () {
  return del(conf.CACHE_DIR_NAME);
});

gulp.task('clean-bundle', function () {
  return del(['build/**/__tests__/', 'build/**/*.tpl.html.js', 'build/**/*.tpl.html.js.map']);
});
