const path = require('path');
const requireAll = require('require-all');
const DefaultRegistry = require('undertaker-registry');

class WebuiTask extends DefaultRegistry {
  init(gulp) {
    requireAll({
      dirname: path.resolve(__dirname, 'src/tasks'),
      filter: /(.*)\.js$/,
      resolve: (TaskRegistry) => {
        gulp.registry(new TaskRegistry());
      },
    });

    gulp.task('init', gulp.series('copy', 'mt'));

    gulp.task(
      'start',
      gulp.series(
        'clean:build',
        'init',
        'bundle:asset',
        'postcss',
        'sprite:img',
        'sprite:css',
        'bundle:html',
        'server:tsc',
        'server:tpl',
        'clean:bundle',
        'watch',
      ),
    );

    gulp.task(
      'build',
      gulp.series(
        'clean:build',
        'init',
        'imagemin',
        'bundle:asset',
        'babel',
        'postcss',
        'sus',
        'sprite:img',
        'sprite:css',
        'versioning:asset',
        'bundle:html',
        'versioning:html',
        'versioning:clean',
        'minify',
        'server:tsc',
        'server:tpl',
        'clean:bundle',
      ),
    );
  }
}

module.exports = WebuiTask;
