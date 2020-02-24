const fs = require('fs'),
  path = require('path'),
  gulp = require('../').gulp(),
  log = require('fancy-log'),
  chalk = require('chalk'),
  Vinyl = require('vinyl'),
  conf = require('./conf'),
  util = require('./util'),
  through = require('through2');

const DEFAULT_CACHE_BASE = path.resolve(conf.CACHE_DIR_NAME, conf.ENV);

function replaceExtName(filePath, extName) {
  const ext = path.extname(filePath).toLowerCase();
  if (extName === 0) {
    return filePath;
  }

  if (/\.(js|jsx|ts|tsx)$/.test(filePath)) {
    extName = '.js';
  } else if (/\.tpl\.html$/.test(filePath)) {
    extName = ext + '.js';
  } else {
    extName = ext;
  }

  if (ext) {
    filePath = filePath.slice(0, -ext.length) + extName;
  } else {
    filePath = filePath + extName;
  }
  return filePath;
}

module.exports = function(
  taskName,
  base,
  workerStream,
  { writeCache = true, cacheBase = DEFAULT_CACHE_BASE, targetExtName } = {
    writeCache: true,
    cacheBase: DEFAULT_CACHE_BASE,
  },
) {
  base = path.resolve(base || '');
  let totalCount = 0;
  let cacheCount = 0;
  const cacheStream = through.obj(function(file, enc, next) {
    if (!file.isBuffer()) {
      next();
      return;
    }
    totalCount++;
    const self = this;
    const digest = util.getDigest(file.contents);
    const cachePath = path.resolve(cacheBase, path.relative(base, file.path));
    const cacheVersionPath = cachePath + '.' + digest;
    if (conf.USE_CACHE && fs.existsSync(cacheVersionPath)) {
      cacheCount++;
      file.path = replaceExtName(file.path, targetExtName);
      file.contents = fs.readFileSync(cacheVersionPath);
      this.push(file);
      if (taskName == 'minify' && fs.existsSync(cacheVersionPath + '.map')) {
        const newFile = new Vinyl({
          base: cacheBase,
          cwd: file.cwd,
          path: cachePath + '.map',
          contents: fs.readFileSync(cacheVersionPath + '.map'),
        });
        this.push(newFile);
      }
      next();
    } else {
      const ws = workerStream();
      const ms = ws.pipe(
        through.obj(function(file, enc, cb) {
          if (path.extname(file.path).toLowerCase() == '.map') {
            self.push(file);
            if (writeCache) {
              const newFile = new Vinyl({
                base: cacheBase,
                cwd: file.cwd,
                path: cacheVersionPath + '.map',
                contents: Buffer.from(file.contents),
              });
              this.push(newFile);
            }
            cb();
          } else {
            self.push(file);
            next();
            if (writeCache) {
              const newFile = new Vinyl({
                base: cacheBase,
                cwd: file.cwd,
                path: cacheVersionPath,
                contents: Buffer.from(file.contents),
              });
              this.push(newFile);
            }
            cb();
          }
        }),
      );
      writeCache && ms.pipe(gulp.dest(cacheBase));
      ws.end(file);
    }
  });
  cacheStream.on('finish', function() {
    log(chalk.blue(taskName) + ' cache hit rate ' + cacheCount + '/' + totalCount);
  });
  return cacheStream;
};

module.exports.wirteCacheFile = function(file, cacheBase = DEFAULT_CACHE_BASE) {
  const ws = through.obj();
  ws.pipe(gulp.dest(cacheBase));
  ws.end(file);
};

module.exports.getDefaultCacheBase = function() {
  return DEFAULT_CACHE_BASE;
};
