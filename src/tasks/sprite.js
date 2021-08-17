const imgCssSprite = require('gulp-img-css-sprite')
const DefaultRegistry = require('undertaker-registry')
const util = require('../utils/util')

class SpriteTask extends DefaultRegistry {
  init(gulp) {
    gulp.task('sprite:img', function () {
      return gulp
        .src([util.getWorkingDir('build') + '/**/*.+(jpg|png)', 'build/common/**/*.+(jpg|png)'])
        .pipe(
          imgCssSprite.imgStream({
            padding: 1,
          })
        )
        .pipe(gulp.dest('build'))
    })

    gulp.task('sprite:css', function () {
      return gulp
        .src([util.getWorkingDir('build') + '/**/*.css', 'build/common/**/*.css'])
        .pipe(
          imgCssSprite.cssStream({
            baseDir: 'build',
          })
        )
        .pipe(gulp.dest('build'))
    })
  }
}

module.exports = SpriteTask
