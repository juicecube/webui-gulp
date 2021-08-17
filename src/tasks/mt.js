const path = require('path')
const mt2amd = require('gulp-mt2amd')
const cache = require('../utils/cache')
const util = require('../utils/util')
const DefaultRegistry = require('undertaker-registry')

class MtTask extends DefaultRegistry {
  init(gulp) {
    gulp.task('mt', function () {
      return gulp
        .src(['src/common/**/*.tpl.html', util.getWorkingDir('src') + '/**/*.tpl.html'], { base: path.resolve('src') })
        .pipe(
          cache('mt', 'src', function () {
            return mt2amd({
              strictMode: true,
              commonjs: true,
              babel: util.babel,
            })
          })
        )
        .pipe(gulp.dest('www/build/tpl'))
    })
  }
}

module.exports = MtTask
