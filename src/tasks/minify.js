const path = require('path')
const gulpif = require('gulp-if')
const minify = require('gulp-minifier')
const conf = require('../utils/conf')
const cache = require('../utils/cache')
const DefaultRegistry = require('undertaker-registry')

class MinifyTask extends DefaultRegistry {
  init(gulp) {
    // minify js, css, html
    gulp.task('minify', function () {
      const doMinify = (conf.ENV === 'production' || conf.ENV === 'staging') && !process.env.NO_MINIFY
      return gulp
        .src(['build/**/*.+(js|css|html)', '!build/**/*.min.+(js|css)'], { base: path.resolve('build') })
        .pipe(
          gulpif(
            doMinify,
            cache('minify', 'build', function () {
              return minify({
                minify: doMinify,
                minifyHTML: {
                  removeComments: true,
                  collapseWhitespace: true,
                  conservativeCollapse: false,
                },
                minifyJS: {
                  sourceMap: {
                    getUrl: function (sourcePath) {
                      return path.basename(sourcePath) + '.map'
                    },
                  },
                  output: {
                    comments: false,
                  },
                },
                minifyCSS: {
                  sourceMap: true,
                  sourceMapInlineSources: true,
                },
              })
            })
          )
        )
        .pipe(gulp.dest('build'))
    })
  }
}

module.exports = MinifyTask
