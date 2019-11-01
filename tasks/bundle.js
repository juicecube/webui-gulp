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
  rollupReplace = require('rollup-plugin-replace'),
  envify = require('process-envify'),
  htmlI18n = require('gulp-html-i18n'),
  htmlOptimizer = require('gulp-html-optimizer'),
  propertyMerge = require('gulp-property-merge');

const md5map = {};
const doMinify = conf.IS_PROD && !process.env.NO_MINIFY;

// bundle
gulp.task('bundle', ['bundle:html', 'bundle:ts']);

gulp.task('bundle:ts', function () {
  return gulp
    .src([util.getWorkingDir('src') + '/**/main.ts'], {base: path.resolve('src')})
    .pipe(
      through.obj(function (file, enc, next) {
        const prefix = path.dirname(file.path).split(/\/scripts(\/|$)/).pop().replace(/(\/|-)+/g, '_');
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
            rollupReplace({
              ...envify({
                NODE_ENV: conf.ENV
              })
            }),
            rollupMt2amd({babel: util.babel, strictMode: true})
          ]
        }).then(function (bundle) {
          return bundle.write({
            file: outPath,
            format: 'iife',
            name: 'G.' + (prefix ? prefix + '_main' : 'main'),
            sourcemap: true
          });
        }).then(function () {
          next();
        });
      })
    );
});

gulp.task('bundle:html:init', ['mt', 'sass', 'less', 'bundle:ts'], function () {
  return gulp
    .src(
      [
        util.getWorkingDir('src') + '/**/*.html',
        '!**/*.layout.html',
        '!**/*.inc.html',
        '!**/*.tpl.html'
      ],
      {base: path.resolve('src')}
    )
    .pipe(
      propertyMerge({
        properties: Object.assign(
          {},
          conf
        )
      })
    )
    .pipe(
      htmlOptimizer({
        baseDir: 'dist',
        minifyJS: doMinify && {
          output: {
            comments: /^remove_all_comments/
          }
        },
        minifyCSS: doMinify,
        enableCache: !isWatching(),
        optimizeRequire: false,
        postcss: util.postcss,
        envify: {
          env: {
            NODE_ENV: conf.ENV
          }
        }
      })
    )
    .pipe(gulp.dest('dist'));
});

// optimize html
gulp.task('bundle:html:optimize', ['bundle:html:init'], function () {
  return gulp
    .src(
      [
        util.getWorkingDir('dist') + '/**/*.html',
        '!dist/zh-CN/**/*.html'
      ],
      {base: path.resolve('dist')}
    )
    .pipe(lazyTasks.lazyHtmlI18nTask()())
    .pipe(htmlI18n.restorePath())
    .pipe(
      htmlOptimizer({
        baseDir: 'dist',
        minifyJS: doMinify && {
          output: {
            comments: /^remove_all_comments/
          }
        },
        minifyCSS: doMinify,
        strictModeTemplate: true,
        isRelativeDependency: util.isRelativeDependency,
        postcss: util.postcss,
        envify: {
          env: {
            NODE_ENV: conf.ENV
          }
        }
      })
    )
    .pipe(
      useref({
        searchPath: path.resolve('dist'),
        base: path.resolve('dist'),
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
      .src([util.getWorkingDir('dist') + '/**/*.html'], {base: path.resolve('dist')})
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
