const sus = require('gulp-sus')
const DefaultRegistry = require('undertaker-registry')

class SusTask extends DefaultRegistry {
  init(gulp) {
    gulp.task('sus', function () {
      return gulp
        .src(['build/**/*.css'])
        .pipe(
          sus({
            baseDir: 'build',
            match: function (p) {
              const m = p.match(/(.+)\?data$/)
              return m && m[1]
            },
          })
        )
        .pipe(gulp.dest('build'))
    })
  }
}

module.exports = SusTask
