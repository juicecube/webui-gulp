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

gulp.task('versioning:css', function () {
  return gulp
    .src(util.appendSrcExclusion(['dist/**/*.css']))
    .pipe(
      digestVersioning({
        digestLength: conf.VERSION_DIGEST_LEN,
        basePath: 'dist',
        destPath: 'dist',
        appendToFileName: true,
        fixUrl: fixUrl
      })
    )
    .pipe(gulp.dest('dist'));
});

gulp.task(
  'versioning:asset',
  [
    'versioning:css'
  ]
);

gulp.task('versioning:html', function () {
  return gulp
    .src(['dist/**/*.html'])
    .pipe(
      digestVersioning({
        digestLength: conf.VERSION_DIGEST_LEN,
        basePath: 'dist',
        destPath: 'dist',
        appendToFileName: true,
        fixUrl: fixUrl
      })
    )
    .pipe(gulp.dest('dist'));
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
