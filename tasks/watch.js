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

let watching = false;

exports.isWatching = function () {
  return watching;
};

// watch for changes and run the relevant task
gulp.task('watch', function () {
  watching = true;

  process.on('uncaughtException', function (err) {
    console.log(err.stack || err.message || err);
  });

  gulp.watch(
    [
      'src/**/*'
    ],
    function (evt) {
      const filePath = evt.path;
      log(chalk.cyan('[changed]'), filePath);
      return gulp.start(['bundle']);
    }
  );
});
