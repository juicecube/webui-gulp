/* global process */

const fs = require('fs'),
  gulp = require('../').gulp(),
  conf = require('./conf'),
  util = require('./util'),
  through = require('through2'),
  useref = require('gulp-useref'),
  userefCostomBlocks = require('./useref-custom-blocks'),
  lazyTasks = require('./lazy-tasks'),
  htmlI18n = require('gulp-html-i18n'),
  htmlOptimizer = require('gulp-html-optimizer'),
  propertyMerge = require('gulp-property-merge');

const md5map = {};
const doMinify = conf.IS_PRODUCTION && !process.env.NO_MINIFY;

// bundle
gulp.task('bundle', ['bundle:html']);

gulp.task('bundle:html:init', function () {
  return gulp
    .src(
      util.appendSrcExclusion([
        'src/**/*.html',
        '!src/**/*.layout.html',
        '!src/**/*.inc.html',
        '!src/**/*.tpl.html'
      ]),
      {base: 'src'}
    )
    .pipe(
      htmlOptimizer({
        baseDir: 'dist',
        minifyJS: doMinify,
        minifyCSS: doMinify,
        optimizeRequire: false
      })
    )
    .pipe(gulp.dest('dist'));
});

// optimize html
gulp.task('bundle:html:optimize', ['bundle:html:init'], function () {
  return gulp
    .src(['dist/**/*.html'])
    .pipe(lazyTasks.lazyHtmlI18nTask()())
    .pipe(htmlI18n.restorePath())
    .pipe(
      htmlOptimizer({
        baseDir: 'dist',
        minifyJS: doMinify,
        minifyCSS: doMinify,
        strictModeTemplate: true,
        isRelativeDependency: util.isRelativeDependency,
        babel: util.babel
      })
    )
    .pipe(
      useref({
        searchPath: process.cwd() + '/dist',
        base: process.cwd() + '/dist',
        types: ['js', 'css', 'asyncloadcss'],
        injectcss: userefCostomBlocks.injectcss,
        asyncloadcss: userefCostomBlocks.asyncloadcss
      })
    )
    .pipe(
      through.obj(function (file, enc, next) {
        file.base = file.base.split(/\/dist(\/|$)/)[0] + '/dist';
        this.push(file);
        next();
      })
    )
    .pipe(htmlI18n.i18nPath())
    .pipe(gulp.dest('dist'));
});

// bundle html
gulp.task(
  'bundle:html',
  ['bundle:html:optimize'],
  function () {
    return gulp
      .src(['dist/**/*.html'])
      .pipe(
        propertyMerge({
          properties: Object.assign(
            {},
            {
              md5map: JSON.stringify(md5map).replace(/"/g, '\\"')
            },
            conf
          )
        })
      )
      .pipe(gulp.dest('dist'));
  }
);
