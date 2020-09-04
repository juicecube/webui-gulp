const fs = require('fs'),
  path = require('path'),
  gulp = require('../').gulp(),
  conf = require('./conf'),
  digestVersioning = require('gulp-digest-versioning');

function skipFileName(fileName, md5List) {
  if (/(&|\?)versioning:skip$/.test(fileName)) {
    return true;
  }

  if (md5List.some(item => fileName.indexOf('.' + item + '.') > 0)) {
    return true;
  }
  return false;
}

function fixSkipUrl(fileName, relPath, baseDir) {
  if (!/(&|\?)versioning:skip$/.test(fileName)) {
    return fileName.replace(/(&|\?)versioning:\w+$/, '');
  }
  return commonFixUrl(fileName, relPath, baseDir);
}

function fixUrl(fileName, relPath, baseDir) {
  if (/(&|\?)versioning:base$/.test(fileName)) {
    return fileName.replace(/(&|\?)versioning:\w+$/, '');
  }
  return commonFixUrl(fileName, relPath, baseDir);
}

function commonFixUrl(fileName, relPath, baseDir) {
  fileName = fileName.replace(/(&|\?)versioning:\w+$/, '');

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
        fixSkipUrl: fixSkipUrl,
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
        fixSkipUrl: fixSkipUrl,
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
