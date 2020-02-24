let gulp = require('gulp');
const requireAll = require('require-all');
const conf = require('./tasks/conf');

const webuiGulp = {
  gulp: function() {
    return gulp;
  },

  use: function(useGulp) {
    if (useGulp) {
      gulp = useGulp;
    }
    return webuiGulp;
  },

  loadTasks: function() {
    requireAll({
      dirname: __dirname + '/tasks',
      filter: /(.*)\.js$/,
      recursive: true,
    });
    webuiGulp.loadTasks = function() {};
    return webuiGulp;
  },

  getConfig: function() {
    return conf;
  },
};

module.exports = webuiGulp;
