const babel = require('gulp-babel')
const DefaultRegistry = require('undertaker-registry')

class BabelTask extends DefaultRegistry {
  init(gulp) {
    gulp.task('babel', function () {
      return gulp
        .src(['build/**/*.js', '!**/_vendor/**/*'], { sourcemaps: true })
        .pipe(babel())
        .pipe(gulp.dest('build', { sourcemaps: '.' }))
    })
  }
}

module.exports = BabelTask
