/* global Buffer */

const path = require('path'),
  log = require('fancy-log'),
  chalk = require('chalk'),
  PluginError = require('plugin-error'),
  conf = require('./conf'),
  lazypipe = require('lazypipe'),
  eslint = require('gulp-eslint'),
  babel = require('gulp-babel'),
  less = require('gulp-less'),
  sass = require('gulp-sass'),
  util = require('./util'),
  envify = require('gulp-envify'),
  postcss = require('gulp-postcss'),
  postcssImport = require('postcss-import'),
  postcssPresetEnv = require('postcss-preset-env'),
  postcssPxToViewport = require('postcss-px-to-viewport'),
  through = require('through2'),
  htmlI18n = require('gulp-html-i18n'),
  rename = require('gulp-rename'),
  htmlOptimizer = require('gulp-html-optimizer'),
  propertyMerge = require('gulp-property-merge');

const EOL = '\n';

// lazy tasks

exports.propertyMergeTask = lazypipe().pipe(
  propertyMerge,
  {
    properties: Object.assign({}, conf)
  }
);

exports.lazyPostcssTask = lazypipe().pipe(
  postcss,
  [
    postcssImport(),
    postcssPresetEnv(),
    postcssPxToViewport({
      viewportWidth: conf.viewportWidth || 750
    })
  ]
);

exports.lazyHtmlI18nTask = function (runId) {
  return lazypipe().pipe(
    htmlI18n,
    {
      runId: runId,
      createLangDirs: true,
      langDir: 'src/locale',
      defaultLang: conf.defaultLang
    }
  );
};

exports.lazyInitHtmlTask = function () {
  const runId = Math.random();

  return lazypipe()
    .pipe(
      propertyMerge,
      {
        properties: Object.assign({}, conf)
      }
    )
    .pipe(exports.lazyHtmlI18nTask(runId))
    .pipe(htmlI18n.restorePath)
    .pipe(
      htmlOptimizer,
      {
        baseDir: 'dist',
        optimizeRequire: 'ifAlways',
        cacheExtend: false,
        strictModeTemplate: true,
        postcss: util.postcss,
        envify: {
          env: {
            NODE_ENV: conf.ENV
          }
        }
      }
    )
    .pipe(exports.lazyHtmlI18nTask(runId))
    .pipe(
      propertyMerge,
      {
        properties: Object.assign(
          {
            md5map: '{}'
          },
          conf
        )
      }
    )
    .pipe(htmlI18n.i18nPath);
};

exports.eslintTask = lazypipe()
  .pipe(
    eslint,
    {fix: conf.ESLINT_FIX}
  )
  .pipe(eslint.format);
