const gulp = require('../').gulp(),
  log = require('fancy-log'),
  through = require('through2'),
  imagemin = require('imagemin'),
  imageminWebp = require('imagemin-webp'),
  imageminPngquant = require('imagemin-pngquant'),
  imageminMozjpeg = require('imagemin-mozjpeg'),
  conf = require('./conf');

gulp.task('imagemin:webp', function (done) {
  if (!process.env.GEN_WEBP) {
    return done();
  }
  gulp
    .src([
      'dist/**/*.+(jpg|jpeg|png)',
      '!dist/**/_vendor/**/*'
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
    .pipe(gulp.dest('dist'))
    .on('finish', function () {
      done();
    });
});

gulp.task('imagemin:png', ['imagemin:webp'], function () {
  gulp
    .src([
      'dist/**/*.png',
      '!dist/**/*.min.png',
      '!dist/**/_vendor/**/*'
    ])
    .pipe(
      through.obj(function (file, enc, next) {
        imagemin
          .buffer(file.contents, {
            plugins: [
              imageminPngquant({
                quality: [0.65, 0.8]
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
    .pipe(gulp.dest('dist'));
});

gulp.task('imagemin:jpg', ['imagemin:webp'], function () {
  gulp
    .src([
      'dist/**/*.+(jpg|jpeg)',
      '!dist/**/*.min.+(jpg|jpeg)',
      '!dist/**/_vendor/**/*'
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
    .pipe(gulp.dest('dist'));
});

gulp.task('imagemin', ['imagemin:png', 'imagemin:jpg', 'imagemin:webp']);
