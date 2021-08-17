const conf = require('./conf')
const lazypipe = require('lazypipe')
const postcss = require('gulp-postcss')
const postcssImport = require('postcss-import')
const postcssPresetEnv = require('postcss-preset-env')
const postcssPxToViewport = require('@mlz/postcss-px-to-viewport')
const htmlI18n = require('gulp-html-i18n')

exports.lazyPostcssTask = lazypipe().pipe(
  postcss,
  [
    postcssImport(),
    postcssPresetEnv(),
    conf.viewportWidth
      ? postcssPxToViewport({
          viewportWidth: conf.viewportWidth,
        })
      : null,
  ].filter((item) => item !== null)
)

exports.lazyHtmlI18nTask = function (runId) {
  return lazypipe().pipe(htmlI18n, {
    runId: runId,
    createLangDirs: true,
    langDir: 'src/locales',
    defaultLang: conf.defaultLang,
  })
}
