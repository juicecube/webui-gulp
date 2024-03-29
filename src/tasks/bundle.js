const path = require('path')
const fs = require('fs')
const gulpif = require('gulp-if')
const through = require('through2')
const useref = require('gulp-useref')
const rollup = require('rollup')
const rollupEsbuild = require('rollup-plugin-esbuild')
const rollupAnalyzer = require('rollup-plugin-analyzer')
const rollupAlias = require('@rollup/plugin-alias')
const rollupTypescript = require('@rollup/plugin-typescript')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const rollupCommonjs = require('@rollup/plugin-commonjs')
const rollupReplace = require('@rollup/plugin-replace')
const rollupMt2amd = require('@mlz/rollup-plugin-mt2amd')
const rollupScss = require('rollup-plugin-scss')
const rollupVue = require('rollup-plugin-vue')
const envify = require('process-envify')
const htmlI18n = require('gulp-html-i18n')
const htmlOptimizer = require('@mlz/gulp-html-optimizer')
const propertyMerge = require('gulp-property-merge')
const DefaultRegistry = require('undertaker-registry')
const conf = require('../utils/conf')
const util = require('../utils/util')
const userefCostomBlocks = require('../utils/useref-custom-blocks')
const lazyTasks = require('../utils/lazy-tasks')


const doMinify = (conf.ENV === 'production' || conf.ENV === 'staging') && !process.env.NO_MINIFY

class BundleTask extends DefaultRegistry {
  init(gulp) {
    gulp.task('bundle:asset:ts', function () {
      return gulp
        .src(['src/common/**/main.ts', util.getWorkingDir('src') + '/**/main.ts'], { base: path.resolve('src') })
        .pipe(
          through.obj(function (file, enc, next) {
            const prefix = path
              .dirname(file.path)
              .split(/\/scripts(\/|$)/)
              .pop()
              .replace(/(?:\/|-)(.)/g, function ($0, $1) {
                return $1.toUpperCase()
              })
            const outDir = path.dirname(path.join('build', path.relative(file.base, file.path)))
            let analysis = null
            rollup
              .rollup({
                input: file.path,
                context: 'window',
                manualChunks:
                  conf.bundleFormat === 'system'
                    ? function (id) {
                        if (id.includes('node_modules')) {
                          return 'vendor'
                        }
                      }
                    : undefined,
                plugins: [
                  process.env.ANALYSIS
                    ? rollupAnalyzer({
                        summaryOnly: true,
                        writeTo: function (content) {
                          const outPath = path.join(outDir, 'main.analysis.txt')
                          analysis = [outPath, content]
                        },
                      })
                    : null,
                  nodeResolve({
                    mainFields: ['module', 'browser', 'main'],
                    preferBuiltins: false,
                  }),
                  rollupCommonjs(),
                  rollupAlias({
                    entries: [
                      { find: 'react', replacement: 'preact/compat' },
                      { find: 'react-dom', replacement: 'preact/compat' },
                      { find: 'react-dom/test-utils', replacement: 'preact/test-utils' },
                    ],
                  }),
                  conf.ENV === 'local'
                    ? rollupEsbuild({
                        sourceMap: true,
                        target: 'esnext',
                      })
                    : rollupTypescript(),
                  rollupReplace({
                    preventAssignment: false,
                    ...envify({
                      NODE_ENV: conf.ENV,
                    }),
                  }),
                  rollupMt2amd({ babel: util.babel, strictMode: true }),
                  rollupScss({
                    output: path.join(outDir, 'main.css'),
                    importer: function (url) {
                      if (url.indexOf('~') === 0) {
                        const filePath = path.join(path.resolve('node_modules'), url.slice(1))
                        return { file: filePath }
                      }
                      return { file: url }
                    },
                  }),
                  rollupVue(),
                ],
              })
              .then(function (bundle) {
                if (conf.bundleFormat === 'system') {
                  return bundle.write({
                    dir: outDir,
                    format: 'system',
                    chunkFileNames: '[name]-chunk.[hash].js',
                    sourcemap: true,
                  })
                } else {
                  return bundle.write({
                    dir: outDir,
                    format: 'iife',
                    name: prefix ? prefix + 'Main' : 'main',
                    sourcemap: true,
                  })
                }
              })
              .then(function () {
                if (analysis) {
                  fs.writeFileSync(analysis[0], analysis[1])
                }
                next()
              })
              .catch(function (err) {
                next(err)
              })
          })
        )
    })

    gulp.task('bundle:asset', gulp.series('bundle:asset:ts'))

    gulp.task('bundle:html:init', function () {
      return gulp
        .src([util.getWorkingDir('src') + '/**/*.html', '!**/*.layout.html', '!**/*.inc.html', '!**/*.tpl.html'], {
          base: path.resolve('src'),
        })
        .pipe(
          propertyMerge({
            properties: Object.assign({}, conf),
            fallback: '',
          })
        )
        .pipe(
          htmlOptimizer({
            baseDir: 'build',
            babel: util.babel,
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
            layoutPreprocess: function (file, cb) {
              file.contents = Buffer.from(
                propertyMerge.replaceProperties(file, {
                  properties: Object.assign({}, conf),
                  fallback: '',
                })
              )
              cb(file)
            },
          })
        )
        .pipe(gulp.dest('build'))
      cb()
    })

    gulp.task(
      'bundle:html:optimize',
      gulp.series('bundle:html:init', function () {
        return gulp
          .src([util.getWorkingDir('build') + '/**/*.html', '!build/zh-CN/**/*.html'], { base: path.resolve('build') })
          .pipe(gulpif(!!conf.defaultLang, lazyTasks.lazyHtmlI18nTask()()))
          .pipe(gulpif(!!conf.defaultLang, htmlI18n.restorePath()))
          .pipe(
            htmlOptimizer({
              baseDir: 'build',
              babel: util.babel,
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
            })
          )
          .pipe(
            useref({
              searchPath: path.resolve('build'),
              base: path.resolve('build'),
              types: ['js', 'css', 'asyncloadcss'],
              injectcss: userefCostomBlocks.injectcss,
              asyncloadcss: userefCostomBlocks.asyncloadcss,
            })
          )
          .pipe(
            gulpif(
              conf.ENV === 'local',
              through.obj(function (file, enc, next) {
                const content = file.contents
                  .toString()
                  .replace(/\{\s*__RUNTIME_CONFIG_INJECT__\s*:\s*1\s*\}/, JSON.stringify(conf.runtime))
                file.contents = Buffer.from(content)
                file.base = file.base.split(/\/build(\/|$)/)[0] + '/build'
                this.push(file)
                next()
              })
            )
          )
          .pipe(
            propertyMerge({
              properties: Object.assign({}, conf),
              fallback: '',
            })
          )
          .pipe(gulpif(!!conf.defaultLang, htmlI18n.i18nPath()))
          .pipe(gulp.dest('build'))
      })
    )

    gulp.task('bundle:html', gulp.series('bundle:html:init', 'bundle:html:optimize'))
  }
}

module.exports = BundleTask
