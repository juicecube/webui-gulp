const gulp = require('../').gulp(),
  conf = require('./conf'),
  lazyTasks = require('./lazy-tasks'),
  htmlI18n = require('gulp-html-i18n'),
  mt2amd = require('gulp-mt2amd');

// validate consistence between each lang version
gulp.task('i18n:validate', function () {
  return gulp.src(['src/locales/**/*.json']).pipe(
    htmlI18n.validateJsonConsistence({
      langDir: 'src/locales'
    })
  );
});

// sort key in lang json
// caution!!! this will overwrite the source file in src folder!!!
gulp.task('i18n:sort', ['i18n:validate'], function () {
  return gulp
    .src(['src/locales/**/*.json'])
    .pipe(
      htmlI18n.jsonSortKey({
        endWithNewline: true,
        reserveOrder: function (keyStack) {
          return keyStack[1] == 'option' && keyStack.length === 3;
        }
      })
    )
    .pipe(gulp.dest('src/locales'));
});
