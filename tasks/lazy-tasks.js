const conf = require('./conf'),
  lazypipe = require('lazypipe'),
  postcss = require('gulp-postcss'),
  postcssImport = require('postcss-import'),
  postcssPresetEnv = require('postcss-preset-env'),
  postcssPxToViewport = require('postcss-px-to-viewport'),
  htmlI18n = require('gulp-html-i18n');

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
  ].filter(item => item !== null),
);

exports.lazyHtmlI18nTask = function(runId) {
  return lazypipe().pipe(htmlI18n, {
    runId: runId,
    createLangDirs: true,
    langDir: 'src/locales',
    defaultLang: conf.defaultLang,
  });
};
