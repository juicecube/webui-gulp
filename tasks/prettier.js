const path = require('path'),
  gulp = require('../').gulp(),
  log = require('fancy-log'),
  chalk = require('chalk'),
  through = require('through2'),
  prettierEslint = require('prettier-eslint'),
  cache = require('./cache'),
  util = require('./util'),
  conf = require('./conf');

const ESLINT_RC_FILE = '.eslintrc.json';
const ESLINT_RC_TS_FILE = '.eslintrc.ts.json';
const PRETTIER_RC_FILE = '.prettierrc.json';

function prettier({logFile} = {}) {
  const eslintConfig = util.safeRequireJson(ESLINT_RC_FILE);
  const eslintTsConfig = util.safeRequireJson(ESLINT_RC_TS_FILE);
  const prettierOptions = util.safeRequireJson(PRETTIER_RC_FILE);
  if (!eslintConfig) {
    throw new Error('gulp prettier: ' + ESLINT_RC_FILE + ' file not exist!');
  }
  return through.obj(function (file, enc, next) {
    logFile && log(chalk.blue('prettier ') + file.path);
    const content = prettierEslint({
      text: file.contents.toString(),
      eslintConfig: (/\.tsx?$/).test(file.path) ? eslintTsConfig : eslintConfig,
      prettierOptions: prettierOptions,
      fallbackPrettierOptions: {}
    });
    file.contents = Buffer.from(content);
    this.push(file);
    next();
  });
}

gulp.task('prettier', function (done) {
  const changedFiles = util.getChangedFiles().filter(function (item) {
    return (
      item.indexOf('src/' === 0)
      && (/\.(js|jsx|ts|tsx)$/i).test(item)
    );
  });
  if (!changedFiles.length) {
    done();
    return;
  }
  gulp
    .src(
      [
        ...changedFiles,
        '!**/_vendor/**/*'
      ],
      {base: path.resolve('src')}
    )
    .pipe(prettier({logFile: true}))
    .pipe(gulp.dest('src'))
    .on('finish', done);
});

gulp.task('prettier-all', function () {
  return gulp
    .src(
      [
        'src/**/*.+(js|jsx|ts|tsx)',
        '!**/_vendor/**/*'
      ]
    )
    .pipe(
      cache('prettier-all', 'src', prettier, {
        cacheBase: path.resolve(conf.CACHE_DIR_NAME, 'prettier'),
        targetExtName: 0
      })
    )
    .pipe(gulp.dest('src'));
});

exports.prettier = prettier;
