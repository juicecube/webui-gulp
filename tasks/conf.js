/* global process */

const _ = require('underscore'),
  fs = require('fs'),
  path = require('path'),
  log = require('fancy-log'),
  chalk = require('chalk');

if (fs.realpathSync(path.join(process.cwd(), 'node_modules/@mlz/webui-gulp/tasks')) != __dirname) {
  log(chalk.red('Please run gulp in the project root dir.'));
  process.exit(1);
}

let config;
try {
  config = require(path.resolve('./config'));
} catch (e) {
  config = {};
}

const GIVEN_ENV = process.env.front_env || process.env.NODE_ENV;
const ENV = config.envs && config.envs[GIVEN_ENV]
  ? GIVEN_ENV
  : 'local';

const conf = (function () {
  const defaultConf = {};
  const runtimeConf = config.envs && config.envs[ENV] || {};
  const conf = _.omit(
    Object.assign(
      {
        RUNTIME_CONFIG: runtimeConf
      },
      defaultConf,
      config,
      runtimeConf
    ),
    ['envs']
  );

  // overwrite config from command line
  for (const p in conf) {
    if (process.env[p]) {
      conf[p] = process.env[p];
    }
  }

  return conf;
})();

conf.BUILD_TIME = new Date().toISOString();
conf.CACHE_DIR_NAME = '.build-cache';
conf.WORKING_DIR = (process.env.WORKING_DIR || '').replace(/^\/+|\/+$/, '');
conf.USE_CACHE = process.env.BUILD_CACHE != '0';
conf.USE_HTTPS = process.env.USE_HTTPS == '1';
conf.ESLINT_FIX = process.env.ESLINT_FIX == '1';
conf.APP_VERSION = require(path.resolve('package.json')).version || '';
conf.ENV = ENV;
conf.VERSION_DIGEST_LEN = 7;

log(
  'Running env '
    + chalk.green(ENV)
    + ' with config '
    + chalk.gray(JSON.stringify(conf, null, 2))
);

module.exports = conf;
