const os = require('os')
const fs = require('fs')
const crypto = require('crypto')
const { execFileSync } = require('child_process')
const stripJsonComments = require('strip-json-comments')
const babel = require('gulp-babel')
const postcss = require('gulp-postcss')
const postcssImport = require('postcss-import')
const postcssPresetEnv = require('postcss-preset-env')
const postcssPxToViewport = require('@mlz/postcss-px-to-viewport')
const through = require('through2')
const conf = require('./conf')

function execGitCmd(args) {
  return execFileSync('git', args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
    encoding: 'utf-8',
  })
    .trim()
    .toString()
    .split('\n')
}

let workingDir

exports.getWorkingDir = function (src) {
  return src.replace(/\/+$/, '') + (workingDir ? '/' + workingDir : '')
}

exports.changeWorkingDir = function (dir = '') {
  workingDir = dir.replace(/^\/+|\/+$/, '')
}

exports.getDigest = function (content) {
  return crypto.createHash('md5').update(content).digest('hex').slice(0, conf.VERSION_DIGEST_LEN)
}

exports.isRelativeDependency = function (dep, isRelative, reqFilePath) {
  if (dep == './main') {
    return true
  } else if (/[{}]|\bmain$/.test(dep)) {
    return false
  } else {
    return isRelative
  }
}

exports.getChangedFiles = function () {
  return execGitCmd(['diff', '--name-only', '--diff-filter=ACMRTUB', 'HEAD'])
    .concat(execGitCmd(['ls-files', '--others', '--exclude-standard']))
    .filter(function (item) {
      return item !== ''
    })
}

exports.safeRequireJson = function (path) {
  if (!fs.existsSync(path)) {
    return null
  }
  return JSON.parse(stripJsonComments(fs.readFileSync(path).toString()))
}

exports.babel = function (file) {
  return new Promise(function (resolve, reject) {
    const stream = babel()
    stream.pipe(
      through.obj(function (file, enc, next) {
        resolve(file)
      })
    )
    stream.on('error', reject)
    stream.end(file)
  })
}

exports.postcss = function (file) {
  return new Promise(function (resolve, reject) {
    const stream = postcss(
      [
        postcssImport(),
        postcssPresetEnv(),
        conf.viewportWidth
          ? postcssPxToViewport({
              viewportWidth: conf.viewportWidth,
            })
          : null,
      ].filter((item) => item !== null)
    )
    stream.pipe(
      through.obj(function (file, enc, next) {
        resolve(file)
      })
    )
    stream.on('error', reject)
    stream.end(file)
  })
}

exports.getLanIp = function () {
  for (const [dev, items] of Object.entries(os.networkInterfaces())) {
    if (dev === 'en0') {
      for (const item of items) {
        if (item.family === 'IPv4') {
          return item.address
        }
      }
    }
  }
}
