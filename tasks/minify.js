const path = require('path'),
  gulp = require('../').gulp(),
  conf = require('./conf'),
  cache = require('./cache'),
  gulpif = require('gulp-if'),
  minify = require('gulp-minifier');

// minify js, css, html
gulp.task('minify', function () {
  const doMinify = conf.IS_PROD && !process.env.NO_MINIFY;

  return gulp
    .src(
      [
        'build/**/*.+(js|css|html)',
        '!build/**/*.min.+(js|css)'
      ],
      {base: path.resolve('build')}
    )
    .pipe(
      gulpif(
        doMinify,
        cache('minify', 'build', function () {
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
              },
              output: {
                comments: /^remove_all_comments/
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
    .pipe(gulp.dest('build'));
});
