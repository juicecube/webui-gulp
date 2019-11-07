const exec = require('child_process').exec,
  gulp = require('../').gulp(),
  conf = require('./conf'),
  less = require('gulp-less'),
  sass = require('gulp-sass'),
  cache = require('./cache'),
  through = require('through2'),
  PluginError = require('plugin-error'),
  util = require('./util'),
  lazyTasks = require('./lazy-tasks');

gulp.task('less', function (done) {
  return gulp
    .src(
      [
        'src/**/*-main.less',
        'src/**/main.less'
      ]
    )
    .pipe(less())
    .on('error', function (err) {
      done(err);
    })
    .pipe(lazyTasks.lazyPostcssTask())
    .on('error', function (err) {
      done(err);
    })
    .pipe(gulp.dest('build'));
});

gulp.task('sass', function (done) {
  return gulp
    .src(
      [
        'src/**/*-main.scss',
        'src/**/main.scss'
      ]
    )
    .pipe(sass())
    .on('error', function (err) {
      done(err);
    })
    .pipe(lazyTasks.lazyPostcssTask())
    .on('error', function (err) {
      done(err);
    })
    .pipe(gulp.dest('build'));
});

gulp.task('img', function () {
  return gulp
    .src(
      [
        'src/**/*.+(jpg|jpeg|gif|png|otf|eot|svg|ttf|woff|woff2|ico|mp3|swf)'
      ]
    )
    .pipe(gulp.dest('build'));
});
