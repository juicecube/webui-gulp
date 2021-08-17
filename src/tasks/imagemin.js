const log = require('fancy-log')
const through2 = require('through2')
const imagemin = require('imagemin')
const imageminWebp = require('@mlz/imagemin-webp')
const imageminOptipng = require('@mlz/imagemin-optipng')
const imageminMozjpeg = require('@mlz/imagemin-mozjpeg')
const DefaultRegistry = require('undertaker-registry')

class ImageminTask extends DefaultRegistry {
  init(gulp) {
    gulp.task('imagemin:webp', function (cb) {
      if (!process.env.GEN_WEBP) {
        return cb()
      }
      return gulp
        .src(['build/**/*.+(jpg|jpeg|png)', '!build/**/_vendor/**/*'])
        .pipe(
          through2.obj(function (file, enc, next) {
            console.log('--------------', file)
            imagemin
              .buffer(file.contents, {
                plugins: [
                  imageminWebp({
                    quality: 75,
                  }),
                ],
              })
              .then((data) => {
                file.contents = data
                file.path = file.path.replace(/\.(jpg|jpeg|png)$/i, '.webp')
                this.push(file)
                next()
              })
              .catch((err) => {
                log('imagemin: error with file "' + file.path + '"')
                next(err)
              })
          })
        )
        .pipe(gulp.dest('build'))
    })

    gulp.task(
      'imagemin:png',
      gulp.series('imagemin:webp', function () {
        return gulp
          .src(['build/**/*.png', '!build/**/*.min.png', '!build/**/_vendor/**/*'])
          .pipe(
            through2.obj(function (file, enc, next) {
              imagemin
                .buffer(file.contents, {
                  plugins: [
                    imageminOptipng({
                      optimizationLevel: 4,
                    }),
                  ],
                })
                .then((data) => {
                  file.contents = data
                  this.push(file)
                  next()
                })
                .catch((err) => {
                  log('imagemin: error with file "' + file.path + '"')
                  next(err)
                })
            })
          )
          .pipe(gulp.dest('build'))
      })
    )

    gulp.task(
      'imagemin:jpg',
      gulp.series('imagemin:webp', function () {
        return gulp
          .src(['build/**/*.+(jpg|jpeg)', '!build/**/*.min.+(jpg|jpeg)', '!build/**/_vendor/**/*'])
          .pipe(
            through2.obj(function (file, enc, next) {
              imagemin
                .buffer(file.contents, {
                  plugins: [
                    imageminMozjpeg({
                      quality: 75,
                    }),
                  ],
                })
                .then((data) => {
                  file.contents = data
                  this.push(file)
                  next()
                })
                .catch((err) => {
                  log('imagemin: error with file "' + file.path + '"')
                  next(err)
                })
            })
          )
          .pipe(gulp.dest('build'))
      })
    )

    gulp.task('imagemin', gulp.series('imagemin:png', 'imagemin:jpg', 'imagemin:webp'))
  }
}

module.exports = ImageminTask
