const fs = require('fs'),
  path = require('path'),
  gulp = require('../').gulp(),
  conf = require('./conf'),
  util = require('./util'),
  digestVersioning = require('gulp-digest-versioning');

function fixUrl(fileName, relPath, basePath) {
  if (!(/^\//).test(fileName)) {
    const filePath = path.resolve(path.dirname(relPath), fileName);
    fileName = path.relative(basePath, filePath);
  }
  return conf.cdnBase.replace(/\/$/, '') + '/' + fileName.replace(/^\//, '');
}

gulp.task('versioning:asset', function () {
  return gulp
    .src(
      [
        'build/**/*.css',
        'build/**/*.js',
        '!**/_vendor/**/*'
      ]
    )
    .pipe(
      digestVersioning({
        digestLength: conf.VERSION_DIGEST_LEN,
        basePath: 'build',
        destPath: 'build',
        appendToFileName: true,
        fixUrl: fixUrl
      })
    )
    .pipe(gulp.dest('build'));
});

gulp.task('versioning:html', function () {
  return gulp
    .src(['build/**/*.html'])
    .pipe(
      digestVersioning({
        digestLength: conf.VERSION_DIGEST_LEN,
        basePath: 'build',
        destPath: 'build',
        appendToFileName: true,
        fixUrl: fixUrl
      })
    )
    .pipe(gulp.dest('build'));
});

gulp.task('versioning:clean', function (done) {
  digestVersioning.getRenamedFiles().forEach(function (fileName) {
    if (fs.existsSync(fileName)) {
      fs.unlinkSync(fileName);
    }
    if (fs.existsSync(fileName + '.map')) {
      fs.unlinkSync(fileName + '.map');
    }
  });
  done();
});
