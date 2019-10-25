let gulp = require('gulp');
const requireAll = require('require-all');

const webuiGulp = {
  gulp: function (useGulp) {
    if (useGulp) {
      gulp = useGulp;
      return webuiGulp;
    }
    return gulp;
  },

  loadTasks: function () {
    requireAll({
      dirname: __dirname + '/tasks',
      filter: /(.*)\.js$/,
      recursive: true
    });
    webuiGulp.loadTasks = function () {};
    return webuiGulp;
  }
};

module.exports = webuiGulp;
