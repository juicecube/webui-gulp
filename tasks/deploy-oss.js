const fs = require('fs'),
  path = require('path'),
  gulp = require('../').gulp(),
  log = require('fancy-log'),
  chalk = require('chalk'),
  Vinyl = require('vinyl'),
  through = require('through2'),
  mime = require('mime'),
  ALY = require('aliyun-sdk'),
  util = require('./util'),
  cache = require('./cache'),
  conf = require('./conf');

mime.default_type = 'text/plain';

const defaultOssConfig = conf.oss || {};

function deployOss(opt, done) {
  const ossAccessKey = conf.getOssAccessKey();
  const ossConfig = opt.ossConfig || defaultOssConfig;
  if (!ossAccessKey.id || !ossAccessKey.secret) {
    throw new Error(
      'deploy-oss: ossAccessKeyId or ossAccessKeySecret undefined!'
    );
  }
  if (!ossConfig.bucket) {
    throw new Error('deploy-oss: bucket undefined!');
  }
  if (!ossConfig.endpoint) {
    throw new Error('deploy-oss: endpoint undefined!');
  }
  let failList = [];
  let retryTimes = 0;
  (function deploy() {
    const src = (failList.length > 0 && failList) || opt.src;
    failList = [];
    let count = 0;
    gulp
      .src(src, {base: 'dist'})
      .pipe(
        through.obj(function (file, enc, next) {
          if (!file.isBuffer()) {
            next();
            return;
          }
          const uploadPath = path.relative(file.base, file.path);
          const digest = util.getDigest(file.contents);
          const cachePath
            = path.resolve(
              cache.getDefaultCacheBase(),
              path.relative(path.resolve('dist'), file.path)
            ) + '.oss';
          if (
            conf.USE_CACHE
            && fs.existsSync(cachePath)
            && fs.readFileSync(cachePath).toString() == digest
          ) {
            log(chalk.blue('cache'), ++count, uploadPath);
            next();
            return;
          }
          const oss = new ALY.OSS({
            accessKeyId: ossAccessKey.id,
            secretAccessKey: ossAccessKey.secret,
            endpoint: ossConfig.endpoint,
            apiVersion: '2013-10-15'
          });
          const headers = {
            Body: file.contents,
            Bucket: ossConfig.bucket,
            Key: uploadPath,
            ContentType: mime.lookup(uploadPath),
            CacheControl: 'max-age=' + 3600 * 1
          };
          oss.putObject(headers, function (err, data) {
            if (err) {
              failList.push(file.path);
              log(chalk.red('fail'), ++count, uploadPath);
              log(err);
            } else {
              cache.wirteCacheFile(
                new Vinyl({
                  base: path.resolve('dist'),
                  cwd: file.cwd,
                  path: file.path + '.oss',
                  contents: Buffer.from(digest)
                })
              );
              log(chalk.green('success'), ++count, uploadPath);
            }
            next();
          });
        })
      )
      .on('finish', function () {
        if (failList.length) {
          log(
            chalk.red('Deploy oss files failed:'),
            '\n' + failList.join('\n')
          );
          // retry 3 times at most
          if (retryTimes < 3) {
            retryTimes++;
            log(chalk.red('Retry deploy oss time ' + retryTimes + '...'));
            deploy();
          } else {
            log(chalk.red('Deploy oss failed!'));
            done();
          }
        } else {
          done();
        }
      })
      .on('error', function (err) {
        done(err);
      });
  })();
}

gulp.task('deploy-oss', function (done) {
  deployOss(
    {
      src: [
        'dist/**/*',
        '!dist/**/*.html'
      ]
    },
    done
  );
});

exports.deployOss = deployOss;
