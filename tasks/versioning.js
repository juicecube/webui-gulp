const fs = require('fs'),
  path = require('path'),
  gulp = require('../').gulp(),
  conf = require('./conf'),
  util = require('./util'),
  digestVersioning = require('gulp-digest-versioning');

function skipFileName(fileName) {
  if (/chunk\.(\w{8})\.js$/.test(fileName)) {
    return true;
  }
  return false;
}

function fixUrl(fileName, relPath, baseDir) {
  if (/chunk\.(\w{8})\.js$/.test(fileName)) {
    return fileName;
  }

  if (!/^\//.test(fileName)) {
    const filePath = path.resolve(path.dirname(relPath), fileName);
    fileName = path.relative(baseDir, filePath);
  }
  return conf.runtime.cdnBase.replace(/\/$/, '') + '/' + fileName.replace(/^\//, '');
}

gulp.task('versioning:asset', function() {
  return gulp
    .src(['build/**/*.css', 'build/**/*.js', '!**/_vendor/**/*'])
    .pipe(
      digestVersioning({
        digestLength: conf.VERSION_DIGEST_LEN,
        baseDir: 'build',
        destDir: 'build',
        appendToFileName: true,
        skipFileName: skipFileName,
        fixUrl: fixUrl,
      }),
    )
    .pipe(gulp.dest('build'));
});

gulp.task('versioning:html', function() {
  return gulp
    .src(['build/**/*.html'])
    .pipe(
      digestVersioning({
        digestLength: conf.VERSION_DIGEST_LEN,
        baseDir: 'build',
        destDir: 'build',
        appendToFileName: true,
        skipFileName: skipFileName,
        fixUrl: fixUrl,
      }),
    )
    .pipe(gulp.dest('build'));
});

gulp.task('versioning:clean', function(done) {
  digestVersioning.getRenamedFiles().forEach(function(fileName) {
    if (fs.existsSync(fileName)) {
      fs.unlinkSync(fileName);
    }

    if (fs.existsSync(fileName + '.map')) {
      fs.unlinkSync(fileName + '.map');
    }
  });
  done();
});
