/* global process, Buffer */

const path = require('path'),
  gulp = require('../').gulp(),
  log = require('fancy-log'),
  chalk = require('chalk'),
  gulpif = require('gulp-if'),
  conf = require('./conf'),
  less = require('gulp-less'),
  sass = require('gulp-sass'),
  envify = require('gulp-envify'),
  eslint = require('gulp-eslint'),
  rename = require('gulp-rename'),
  cache = require('./cache'),
  util = require('./util'),
  lazyTasks = require('./lazy-tasks');

// watch for changes and run the relevant task
gulp.task('watch', function () {
  process.on('uncaughtException', function (err) {
    console.log(err.stack || err.message || err);
  });

  gulp.watch(
    util.appendSrcExclusion([
      'src/**/*.html',
      '!src/**/*.layout.html',
      '!src/**/*.inc.html',
      '!src/**/*.tpl.html'
    ]),
    function (evt) {
      const filePath = evt.path;
      const part = (path.dirname(filePath) + '/').split('/src/').pop();
      log(chalk.cyan('[changed]'), filePath);
      return gulp
        .src(filePath)
        .pipe(lazyTasks.lazyInitHtmlTask()())
        .pipe(gulp.dest('dist/' + part));
    }
  );

  gulp.watch(
    [
      'src/**/*.layout.html',
      'src/**/*.inc.+(html|js|css)',
      'src/**/*.tpl.html'
    ],
    function (evt) {
      const filePath = evt.path;
      log(chalk.cyan('[changed]'), filePath);
      return gulp.start('bundle:html');
    }
  );

  gulp.watch(
    [
      'src/**/*.ts'
    ],
    function (evt) {
      const filePath = evt.path;
      log(chalk.cyan('[changed]'), filePath);
      return gulp.start('bundle:ts');
    }
  );

  gulp.watch(
    util.appendSrcExclusion(['src/**/*.scss', 'src/**/*.less']),
    function (evt) {
      const filePath = evt.path;
      log(chalk.cyan('[changed]'), filePath);
      return gulp.start('bundle:html');
    }
  );

  gulp.watch('src/locale/**/*.json', function (evt) {
    const filePath = evt.path;
    log(chalk.cyan('[changed]'), filePath);
    return gulp.start('i18n:resolve-reference');
  });
});
