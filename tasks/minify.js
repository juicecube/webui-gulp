const path = require('path'),
  gulp = require('../').gulp(),
  conf = require('./conf'),
  cache = require('./cache'),
  gulpif = require('gulp-if'),
  minify = require('gulp-minifier');

// minify js, css, html
gulp.task('minify', function () {
  const doMinify = conf.IS_PRODUCTION && !process.env.NO_MINIFY;

  return gulp
    .src(
      [
        'dist/**/*.+(js|css|html)',
        '!dist/**/*.min.+(js|css)'
      ],
      {base: path.resolve('dist')}
    )
    .pipe(
      gulpif(
        doMinify,
        cache('minify', 'dist', function () {
          return minify({
            minify: doMinify,
            minifyHTML: {
              collapseWhitespace: true,
              conservativeCollapse: false
            },
            minifyJS: {
              sourceMap: {
                getUrl: function (sourcePath) {
                  return path.basename(sourcePath) + '.map';
                }
              }
            },
            minifyCSS: {
              sourceMap: true,
              sourceMapInlineSources: true
            }
          });
        })
      )
    )
    .pipe(gulp.dest('dist'));
});
