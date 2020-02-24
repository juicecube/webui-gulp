const fs = require('fs'),
  path = require('path'),
  crypto = require('crypto'),
  execFileSync = require('child_process').execFileSync,
  stripJsonComments = require('strip-json-comments'),
  babel = require('gulp-babel'),
  postcss = require('gulp-postcss'),
  postcssImport = require('postcss-import'),
  postcssPresetEnv = require('postcss-preset-env'),
  postcssPxToViewport = require('postcss-px-to-viewport'),
  through = require('through2'),
  conf = require('./conf');

function execGitCmd(args) {
  return execFileSync('git', args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
    encoding: 'utf-8',
  })
    .trim()
    .toString()
    .split('\n');
}

exports.getWorkingDir = function(src) {
  return src.replace(/\/+$/, '') + (conf.WORKING_DIR ? '/' + conf.WORKING_DIR : '');
};

exports.getDigest = function(content) {
  return crypto
    .createHash('md5')
    .update(content)
    .digest('hex')
    .slice(0, conf.VERSION_DIGEST_LEN);
};

exports.isRelativeDependency = function(dep, isRelative, reqFilePath) {
  if (dep == './main') {
    return true;
  } else if (/[{}]|\bmain$/.test(dep)) {
    return false;
  } else {
    return isRelative;
  }
};

exports.getChangedFiles = function() {
  return execGitCmd(['diff', '--name-only', '--diff-filter=ACMRTUB', 'HEAD'])
    .concat(execGitCmd(['ls-files', '--others', '--exclude-standard']))
    .filter(function(item) {
      return item !== '';
    });
};

exports.safeRequireJson = function(path) {
  if (!fs.existsSync(path)) {
    return null;
  }
  return JSON.parse(stripJsonComments(fs.readFileSync(path).toString()));
};

exports.babel = function(file) {
  return new Promise(function(resolve, reject) {
    const stream = babel();
    stream.pipe(
      through.obj(function(file, enc, next) {
        resolve(file);
      }),
    );
    stream.on('error', reject);
    stream.end(file);
  });
};

exports.postcss = function(file) {
  return new Promise(function(resolve, reject) {
    const stream = postcss(
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
    stream.pipe(
      through.obj(function(file, enc, next) {
        resolve(file);
      }),
    );
    stream.on('error', reject);
    stream.end(file);
  });
};
