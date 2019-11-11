const gulp = require('../').gulp(),
  log = require('fancy-log'),
  through = require('through2'),
  imagemin = require('imagemin'),
  imageminWebp = require('@mlz/imagemin-webp'),
  imageminOptipng = require('@mlz/imagemin-optipng'),
  imageminMozjpeg = require('@mlz/imagemin-mozjpeg'),
  conf = require('./conf');

gulp.task('imagemin:webp', function (done) {
  if (!process.env.GEN_WEBP) {
    return done();
  }
  gulp
    .src([
      'build/**/*.+(jpg|jpeg|png)',
      '!build/**/_vendor/**/*'
    ])
    .pipe(
      through.obj(function (file, enc, next) {
        imagemin
          .buffer(file.contents, {
            plugins: [
              imageminWebp({
                quality: 75
              })
            ]
          })
          .then(data => {
            file.contents = data;
            file.path = file.path.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            this.push(file);
            next();
          })
          .catch(err => {
            log('imagemin: error with file "' + file.path + '"');
            next(err);
          });
      })
    )
    .pipe(gulp.dest('build'))
    .on('finish', function () {
      done();
    });
});

gulp.task('imagemin:png', ['imagemin:webp'], function () {
  return gulp
    .src([
      'build/**/*.png',
      '!build/**/*.min.png',
      '!build/**/_vendor/**/*'
    ])
    .pipe(
      through.obj(function (file, enc, next) {
        imagemin
          .buffer(file.contents, {
            plugins: [
              imageminOptipng({
                optimizationLevel: 4
              })
            ]
          })
          .then(data => {
            file.contents = data;
            this.push(file);
            next();
          })
          .catch(err => {
            log('imagemin: error with file "' + file.path + '"');
            next(err);
          });
      })
    )
    .pipe(gulp.dest('build'));
});

gulp.task('imagemin:jpg', ['imagemin:webp'], function () {
  return gulp
    .src([
      'build/**/*.+(jpg|jpeg)',
      '!build/**/*.min.+(jpg|jpeg)',
      '!build/**/_vendor/**/*'
    ])
    .pipe(
      through.obj(function (file, enc, next) {
        imagemin
          .buffer(file.contents, {
            plugins: [
              imageminMozjpeg({
                quality: 75
              })
            ]
          })
          .then(data => {
            file.contents = data;
            this.push(file);
            next();
          })
          .catch(err => {
            log('imagemin: error with file "' + file.path + '"');
            next(err);
          });
      })
    )
    .pipe(gulp.dest('build'));
});

gulp.task('imagemin', ['imagemin:png', 'imagemin:jpg', 'imagemin:webp']);
