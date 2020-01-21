/* global process */

const fs = require('fs'),
  path = require('path'),
  log = require('fancy-log'),
  chalk = require('chalk');

if (fs.realpathSync(path.join(process.cwd(), 'node_modules/@mlz/webui-gulp/tasks')) != __dirname) {
  log(chalk.red('Please run gulp in the project root dir.'));
  process.exit(1);
}

const ENV = process.env.NODE_ENV || 'local';

let defaultConf;
let config;
try {
  defaultConf = require(path.resolve('./config/default.json'));
  config = require(path.resolve(`./config/${ENV}.json`));
} catch (e) {
  if (!defaultConf) {
    throw new Error('Can not resolve default config file!');
  }
  if (!config) {
    throw new Error(`Can not resolve config file for env "${ENV}"!`);
  }
}

const conf = Object.assign(
  {},
  defaultConf,
  config
);

conf.BUILD_TIME = new Date().toISOString();
conf.CACHE_DIR_NAME = '.build-cache';
conf.WORKING_DIR = (process.env.WORKING_DIR || '').replace(/^\/+|\/+$/, '');
conf.USE_CACHE = process.env.BUILD_CACHE != '0';
conf.APP_VERSION = require(path.resolve('package.json')).version || '';
conf.ENV = ENV;
conf.VERSION_DIGEST_LEN = 8;

log(
  'Running env '
    + chalk.green(ENV)
    + ' with config '
    + chalk.gray(JSON.stringify(conf, null, 2))
);

module.exports = conf;
