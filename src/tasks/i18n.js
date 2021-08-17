const htmlI18n = require('gulp-html-i18n')
const DefaultRegistry = require('undertaker-registry')

class I18nTask extends DefaultRegistry {
  init(gulp) {
    // validate consistence between each lang version
    gulp.task('i18n:validate', function () {
      return gulp.src(['src/locales/**/*.json']).pipe(
        htmlI18n.validateJsonConsistence({
          langDir: 'src/locales',
        })
      )
    })

    // sort key in lang json
    // caution!!! this will overwrite the source file in src folder!!!
    gulp.task(
      'i18n:sort',
      gulp.series('i18n:validate', function () {
        return gulp
          .src(['src/locales/**/*.json'])
          .pipe(
            htmlI18n.jsonSortKey({
              endWithNewline: true,
              reserveOrder: function (keyStack) {
                return keyStack[1] == 'option' && keyStack.length === 3
              },
            })
          )
          .pipe(gulp.dest('src/locales'))
      })
    )
  }
}

module.exports = I18nTask
