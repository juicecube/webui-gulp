const del = require('del')
const DefaultRegistry = require('undertaker-registry')
const conf = require('../utils/conf')

class CleanTask extends DefaultRegistry {
  init(gulp) {
    gulp.task('clean:build', function () {
      return del(['build/', 'www/build/'])
    })

    gulp.task('clean:cache', function () {
      return del(conf.CACHE_DIR_NAME)
    })

    gulp.task('clean:bundle', function () {
      return del(['build/**/__tests__/', 'build/**/*.html'])
    })
  }
}

module.exports = CleanTask
