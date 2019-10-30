/* global process */

const fs = require('fs'),
  path = require('path'),
  gulp = require('../').gulp(),
  conf = require('./conf'),
  util = require('./util'),
  isWatching = require('./watch').isWatching,
  through = require('through2'),
  useref = require('gulp-useref'),
  userefCostomBlocks = require('./useref-custom-blocks'),
  lazyTasks = require('./lazy-tasks'),
  rollup = require('rollup'),
  rollupTypescript = require('rollup-plugin-typescript'),
  rollupNodeResolve = require('rollup-plugin-node-resolve'),
  rollupCommonjs = require('rollup-plugin-commonjs'),
  rollupMt2amd = require('rollup-plugin-mt2amd'),
  htmlI18n = require('gulp-html-i18n'),
  htmlOptimizer = require('gulp-html-optimizer'),
  propertyMerge = require('gulp-property-merge');

const md5map = {};
const doMinify = conf.IS_PRODUCTION && !process.env.NO_MINIFY;

// bundle
gulp.task('bundle', ['bundle:html', 'bundle:ts']);

gulp.task('bundle:ts', function () {
  return gulp
    .src(['src/**/main.ts'])
    .pipe(
      through.obj(function (file, enc, next) {
        const outPath = path.join('dist', path.relative(file.base, file.path).replace(/\.ts$/, '.js'));
        rollup.rollup({
          input: file.path,
          plugins: [
            rollupNodeResolve({
              mainFields: ['module', 'browser', 'main'],
              preferBuiltins: false
            }),
            rollupCommonjs(),
            rollupTypescript(),
            rollupMt2amd({babel: util.babel})
          ]
        }).then(function (bundle) {
          return bundle.write({
            file: outPath,
            format: 'iife',
            name: 'library',
            sourcemap: true
          });
        }).then(function () {
          next();
        });
      })
    );
});

gulp.task('bundle:html:init', ['mt', 'sass', 'less'], function () {
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
        enableCache: !isWatching(),
        optimizeRequire: false
      })
    )
    .pipe(gulp.dest('dist'));
});

// optimize html
gulp.task('bundle:html:optimize', ['bundle:html:init'], function () {
  return gulp
    .src([
      'dist/**/*.html',
      '!dist/zh-CN/**/*.html'
    ])
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
            conf
          )
        })
      )
      .pipe(gulp.dest('dist'));
  }
);
