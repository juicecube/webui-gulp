/* global process */

const fs = require('fs'),
  path = require('path'),
  gulp = require('../').gulp(),
  conf = require('./conf'),
  util = require('./util'),
  gulpif = require('gulp-if'),
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
const doMinify = (conf.ENV === 'production' || conf.ENV === 'staging') && !process.env.NO_MINIFY;

gulp.task('bundle', ['bundle:html', 'bundle:ts']);

gulp.task('bundle:ts', function () {
  return gulp
    .src([util.getWorkingDir('src') + '/**/main.ts'], {base: path.resolve('src')})
    .pipe(
      through.obj(function (file, enc, next) {
        const prefix = path.dirname(file.path).split(/\/scripts(\/|$)/).pop().replace(/(\/|-)+/g, '_');
        const outPath = path.join('build', path.relative(file.base, file.path).replace(/\.ts$/, '.js'));
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
            name: prefix ? prefix + '_main' : 'main',
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
        baseDir: 'build',
        minifyJS: doMinify && {
          output: {
            comments: /^remove_all_comments/
          }
        },
        minifyCSS: doMinify,
        enableCache: false,
        optimizeRequire: false,
        postcss: util.postcss,
        envify: {
          env: {
            NODE_ENV: conf.ENV
          }
        }
      })
    )
    .pipe(gulp.dest('build'));
});

gulp.task('bundle:html:optimize', ['bundle:html:init'], function () {
  return gulp
    .src(
      [
        util.getWorkingDir('build') + '/**/*.html',
        '!build/zh-CN/**/*.html'
      ],
      {base: path.resolve('build')}
    )
    .pipe(lazyTasks.lazyHtmlI18nTask()())
    .pipe(htmlI18n.restorePath())
    .pipe(
      htmlOptimizer({
        baseDir: 'build',
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
        searchPath: path.resolve('build'),
        base: path.resolve('build'),
        types: ['js', 'css', 'asyncloadcss'],
        injectcss: userefCostomBlocks.injectcss,
        asyncloadcss: userefCostomBlocks.asyncloadcss
      })
    )
    .pipe(
      gulpif(conf.ENV === 'local',
        through.obj(function (file, enc, next) {
          const content = file.contents.toString()
            .replace(/\{\s*__CODEMAO_RUNTIME_CONFIG_INJECT__\s*:\s*1\s*\}/, JSON.stringify(conf.runtime));
          file.contents = Buffer.from(content);
          file.base = file.base.split(/\/build(\/|$)/)[0] + '/build';
          this.push(file);
          next();
        })
      )
    )
    .pipe(
      propertyMerge({
        properties: Object.assign(
          {},
          conf
        )
      })
    )
    .pipe(htmlI18n.i18nPath())
    .pipe(gulp.dest('build'));
});

gulp.task(
  'bundle:html',
  ['bundle:html:init', 'bundle:html:optimize']
);
