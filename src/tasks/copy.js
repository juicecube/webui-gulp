const DefaultRegistry = require('undertaker-registry')

class CopyTask extends DefaultRegistry {
  init(gulp) {
    gulp.task('copy', function () {
      return gulp
        .src(
          [
            'src/robots.txt',
            'src/MP_verify_*.txt',
            'src/**/*.+(jpg|jpeg|gif|png|otf|eot|svg|ttf|woff|woff2|ico|mp3|swf)',
            'src/**/_vendor/**/**',
            '!src/**/*.+(less|scss)',
          ],
          { allowEmpty: true }
        )
        .pipe(gulp.dest('build'))
    })
  }
}

module.exports = CopyTask
