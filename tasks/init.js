const exec = require('child_process').exec,
  gulp = require('../').gulp(),
  conf = require('./conf'),
  less = require('gulp-less'),
  sass = require('gulp-sass'),
  envify = require('gulp-envify'),
  cache = require('./cache'),
  through = require('through2'),
  PluginError = require('plugin-error'),
  util = require('./util'),
  lazyTasks = require('./lazy-tasks');

// revision
gulp.task('revision', function (done) {
  exec('mkdir -p dist && git rev-parse --short HEAD > dist/revision');
  done();
});

// compile less
gulp.task('less', ['less:main']);

// compile main less
gulp.task('less:main', function (done) {
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
    .pipe(gulp.dest('dist'));
});

// compile sass
gulp.task('sass', ['sass:main']);

// compile main sass
gulp.task('sass:main', function (done) {
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
    .pipe(gulp.dest('dist'));
});

// move img
gulp.task('img', function () {
  return gulp
    .src(
      [
        'src/**/*.+(jpg|jpeg|gif|png|otf|eot|svg|ttf|woff|woff2|ico|mp3|swf)'
      ]
    )
    .pipe(gulp.dest('dist'));
});
