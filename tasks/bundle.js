const path = require('path'),
  gulp = require('../').gulp(),
  conf = require('./conf'),
  util = require('./util'),
  gulpif = require('gulp-if'),
  through = require('through2'),
  useref = require('gulp-useref'),
  userefCostomBlocks = require('./useref-custom-blocks'),
  lazyTasks = require('./lazy-tasks'),
  rollup = require('rollup'),
  rollupAlias = require('@rollup/plugin-alias'),
  rollupTypescript = require('@rollup/plugin-typescript'),
  rollupNodeResolve = require('@rollup/plugin-node-resolve'),
  rollupCommonjs = require('@rollup/plugin-commonjs'),
  rollupReplace = require('@rollup/plugin-replace'),
  rollupMt2amd = require('rollup-plugin-mt2amd'),
  rollupScss = require('rollup-plugin-scss'),
  rollupVue = require('rollup-plugin-vue'),
  envify = require('process-envify'),
  htmlI18n = require('gulp-html-i18n'),
  htmlOptimizer = require('gulp-html-optimizer'),
  propertyMerge = require('gulp-property-merge');

const doMinify = (conf.ENV === 'production' || conf.ENV === 'staging') && !process.env.NO_MINIFY;

gulp.task('bundle:asset:ts', function() {
  return gulp
    .src(['src/common/**/main.ts', util.getWorkingDir('src') + '/**/main.ts'], { base: path.resolve('src') })
    .pipe(
      through.obj(function(file, enc, next) {
        const prefix = path
          .dirname(file.path)
          .split(/\/scripts(\/|$)/)
          .pop()
          .replace(/(?:\/|-)(.)/g, function($0, $1) {
            return $1.toUpperCase();
          });
        const outDir = path.dirname(path.join('build', path.relative(file.base, file.path)));
        rollup
          .rollup({
            input: file.path,
            manualChunks:
              conf.bundleFormat === 'system'
                ? function(id) {
                    if (id.includes('node_modules')) {
                      return 'vendor';
                    }
                  }
                : undefined,
            plugins: [
              rollupNodeResolve({
                mainFields: ['module', 'browser', 'main'],
                preferBuiltins: false,
              }),
              rollupCommonjs({
                namedExports: {
                  fingerprintjs2: ['get', 'x64hash128'],
                },
              }),
              rollupAlias({
                entries: [
                  { find: 'react', replacement: 'preact/compat' },
                  { find: 'react-dom', replacement: 'preact/compat' },
                  { find: 'react-dom/test-utils', replacement: 'preact/test-utils' },
                ],
              }),
              rollupTypescript(),
              rollupReplace({
                ...envify({
                  NODE_ENV: conf.ENV,
                }),
              }),
              rollupMt2amd({ babel: util.babel, strictMode: true }),
              rollupScss({
                output: path.join(outDir, 'main.css'),
              }),
              rollupVue(),
            ],
          })
          .then(function(bundle) {
            if (conf.bundleFormat === 'system') {
              return bundle.write({
                dir: outDir,
                format: 'system',
                chunkFileNames: '[name]-chunk.[hash].js',
                sourcemap: true,
              });
            } else {
              return bundle.write({
                dir: outDir,
                format: 'iife',
                name: prefix ? prefix + 'Main' : 'main',
                sourcemap: true,
              });
            }
          })
          .then(function() {
            next();
          })
          .catch(function(err) {
            next(err);
          });
      }),
    );
});

gulp.task('bundle:asset', ['bundle:asset:ts']);

gulp.task('bundle:html:init', function() {
  return gulp
    .src([util.getWorkingDir('src') + '/**/*.html', '!**/*.layout.html', '!**/*.inc.html', '!**/*.tpl.html'], {
      base: path.resolve('src'),
    })
    .pipe(
      propertyMerge({
        properties: Object.assign({}, conf),
        fallback: '',
      }),
    )
    .pipe(
      htmlOptimizer({
        baseDir: 'build',
        minifyJS: doMinify
          ? {
              output: {
                comments: false,
              },
            }
          : {
              compress: false,
              mangle: false,
              output: {
                comments: false,
              },
            },
        minifyCSS: doMinify,
        enableCache: false,
        optimizeRequire: false,
        postcss: util.postcss,
        envify: {
          env: {
            NODE_ENV: conf.ENV,
          },
        },
      }),
    )
    .pipe(gulp.dest('build'));
});

gulp.task('bundle:html:optimize', ['bundle:html:init'], function() {
  return gulp
    .src([util.getWorkingDir('build') + '/**/*.html', '!build/zh-CN/**/*.html'], { base: path.resolve('build') })
    .pipe(gulpif(!!conf.defaultLang, lazyTasks.lazyHtmlI18nTask()()))
    .pipe(gulpif(!!conf.defaultLang, htmlI18n.restorePath()))
    .pipe(
      htmlOptimizer({
        baseDir: 'build',
        minifyJS: doMinify
          ? {
              output: {
                comments: false,
              },
            }
          : {
              compress: false,
              mangle: false,
              output: {
                comments: false,
              },
            },
        minifyCSS: doMinify,
        strictModeTemplate: true,
        isRelativeDependency: util.isRelativeDependency,
        postcss: util.postcss,
        envify: {
          env: {
            NODE_ENV: conf.ENV,
          },
        },
      }),
    )
    .pipe(
      useref({
        searchPath: path.resolve('build'),
        base: path.resolve('build'),
        types: ['js', 'css', 'asyncloadcss'],
        injectcss: userefCostomBlocks.injectcss,
        asyncloadcss: userefCostomBlocks.asyncloadcss,
      }),
    )
    .pipe(
      gulpif(
        conf.ENV === 'local',
        through.obj(function(file, enc, next) {
          const content = file.contents
            .toString()
            .replace(/\{\s*__CODEMAO_RUNTIME_CONFIG_INJECT__\s*:\s*1\s*\}/, JSON.stringify(conf.runtime));
          file.contents = Buffer.from(content);
          file.base = file.base.split(/\/build(\/|$)/)[0] + '/build';
          this.push(file);
          next();
        }),
      ),
    )
    .pipe(
      propertyMerge({
        properties: Object.assign({}, conf),
        fallback: '',
      }),
    )
    .pipe(gulpif(!!conf.defaultLang, htmlI18n.i18nPath()))
    .pipe(gulp.dest('build'));
});

gulp.task('bundle:html', ['bundle:html:init', 'bundle:html:optimize']);
