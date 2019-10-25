const fs = require('fs'),
  path = require('path'),
  crypto = require('crypto'),
  execFileSync = require('child_process').execFileSync,
  stripJsonComments = require('strip-json-comments'),
  babel = require('gulp-babel'),
  through = require('through2'),
  marked = require('marked'),
  conf = require('./conf');

function execGitCmd(args) {
  return execFileSync('git', args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
    encoding: 'utf-8'
  })
    .trim()
    .toString()
    .split('\n');
}

exports.getRevision = function () {
  try {
    const revision = fs
      .readFileSync('dist/revision')
      .toString()
      .trim();
    return revision;
  } catch (err) {
    return '';
  }
};

exports.getDigest = function (content) {
  return crypto
    .createHash('md5')
    .update(content)
    .digest('hex')
    .slice(0, conf.VERSION_DIGEST_LEN);
};

exports.isRelativeDependency = function (dep, isRelative, reqFilePath) {
  if (dep == './main') {
    return true;
  } else if (/[{}]|\bmain$/.test(dep)) {
    return false;
  } else {
    return isRelative;
  }
};

exports.cssModuleClassNameGenerator = function (css) {
  return '_' + exports.getDigest(css);
};

exports.getChangedFiles = function () {
  return execGitCmd(['diff', '--name-only', '--diff-filter=ACMRTUB', 'HEAD'])
    .concat(execGitCmd(['ls-files', '--others', '--exclude-standard']))
    .filter(function (item) {
      return item !== '';
    });
};

exports.safeRequireJson = function (path) {
  if (!fs.existsSync(path)) {
    return null;
  }
  return JSON.parse(stripJsonComments(fs.readFileSync(path).toString()));
};

exports.getExcutablePath = function (name) {
  let executable = path.resolve(__dirname, '../node_modules/.bin/' + name);
  if (!fs.existsSync(executable)) {
    executable = './node_modules/.bin/' + name;
  }
  return executable;
};

exports.appendSrcExclusion = function (src) {
  if (!Array.isArray(src)) {
    src = [src];
  }
  const exclusion = ['!dist/**/_vendor/**/*'];
  if (src[0].split('/')[0] != 'dist') {
    exclusion.push(
      '!src/**/_vendor/**/*'
    );
  }
  return src.concat(exclusion);
};

exports.babel = function (file) {
  return new Promise(function (resolve, reject) {
    const babelStream = babel({sourceType: 'script'});
    babelStream.pipe(
      through.obj(function (file, enc, next) {
        resolve(file);
      })
    );
    babelStream.on('error', reject);
    babelStream.end(file);
  });
};

exports.markedStream = function ({minify = false} = {}) {
  return through.obj(function (file, enc, next) {
    let contents = marked(file.contents.toString());
    if (minify) {
      contents = contents.replace(/\n/g, '').replace(/ +/g, ' ');
    }
    file.contents = Buffer.from(contents);
    file.path = file.path.replace(/\.md$/i, '.html');
    this.push(file);
    next();
  });
};
