const path = require('path')
const { spawn } = require('child_process')
const mt2amd = require('gulp-mt2amd')
const DefaultRegistry = require('undertaker-registry')
const util = require('../utils/util')

class ServerTask extends DefaultRegistry {
  init(gulp) {
    gulp.task('server:tsc', function () {
      return spawn('npx', ['tsc', '--outDir', 'www/build', '--project', 'www/tsconfig.json', '--skipLibCheck'], {
        stdio: 'inherit',
      })
    })

    gulp.task('server:tpl', function () {
      return gulp
        .src([util.getWorkingDir('build') + '/**/*.html'], { base: path.resolve('build') })
        .pipe(
          mt2amd({
            strictMode: true,
            commonjs: true,
            dataInjection: 'G.SERVER_INJECTED_DATA',
            babel: util.babel,
          })
        )
        .pipe(gulp.dest('www/build/tpl'))
    })
  }
}

module.exports = ServerTask
