const path = require('path')
const util = require('../utils/util')
const lazyTasks = require('../utils/lazy-tasks')
const DefaultRegistry = require('undertaker-registry')

class PostcssTask extends DefaultRegistry {
  init(gulp) {
    gulp.task('postcss', function () {
      return gulp
        .src([util.getWorkingDir('build') + '/**/*.css'], { base: path.resolve('build') })
        .pipe(lazyTasks.lazyPostcssTask())
        .pipe(gulp.dest('build'))
    })
  }
}

module.exports = PostcssTask
