const gulp = require('../').gulp(),
  imgCssSprite = require('gulp-img-css-sprite');

gulp.task('sprite:img', function () {
  return gulp
    .src(
      [
        'build/**/*.+(jpg|png)'
      ]
    )
    .pipe(
      imgCssSprite.imgStream({
        padding: 1
      })
    )
    .pipe(gulp.dest('build'));
});

gulp.task('sprite:css', function () {
  return gulp
    .src(
      [
        'build/**/*.css'
      ]
    )
    .pipe(
      imgCssSprite.cssStream({
        baseDir: 'build'
      })
    )
    .pipe(gulp.dest('build'));
});
