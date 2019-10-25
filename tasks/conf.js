/* global process */

const _ = require('underscore'),
  fs = require('fs'),
  path = require('path'),
  log = require('fancy-log'),
  chalk = require('chalk');
const DEFAULT_CONFIG = require('../config');

if (fs.realpathSync(path.join(process.cwd(), 'node_modules/@mlz/webui-gulp/tasks')) != __dirname) {
  log(chalk.red('Please run gulp in the project root dir.'));
  process.exit(1);
}

const ENV = DEFAULT_CONFIG.envs[process.env.NODE_ENV]
  ? process.env.NODE_ENV
  : 'local';

let config;
try {
  config = require(path.resolve('./config'));
} catch (e) {
  config = {};
}

const conf = (function () {
  const defaultConf = Object.assign(
    {},
    DEFAULT_CONFIG,
    DEFAULT_CONFIG.envs[ENV]
  );
  const conf = _.omit(
    Object.assign(
      {},
      defaultConf,
      config,
      config.envs && config.envs[ENV]
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
conf.USE_CACHE = process.env.BUILD_CACHE != '0';
conf.USE_HTTPS = process.env.USE_HTTPS == '1';
conf.ESLINT_FIX = process.env.ESLINT_FIX == '1';
conf.APP_VERSION = require(path.resolve('package.json')).version || '';
conf.ENV = ENV;
conf.VERSION_DIGEST_LEN = 7;
conf.IS_PRODUCTION = ENV == 'production';

let ossAccessKey = null;
conf.getOssAccessKey = function () {
  if (ossAccessKey) {
    return ossAccessKey;
  }
  const id = process.env.OSS_ACCESS_KEY_ID;
  const secret = process.env.OSS_ACCESS_KEY_SECRET;
  if (id && secret) {
    ossAccessKey = {
      id: id,
      secret: secret
    };
  } else {
    const accessKeyPath
      = (conf.oss && conf.oss.accessKeyPath)
      || '/usr/local/etc/lepin/oss-access-key';
    if (!fs.existsSync(accessKeyPath)) {
      throw new Error(
        'OSS access key file "' + accessKeyPath + '" does not exist!'
      );
    }
    const content = fs.readFileSync(accessKeyPath).toString();
    const keys = content.split('\n')[0].split(' ');
    ossAccessKey = {
      id: keys[0],
      secret: keys[1]
    };
  }
  return ossAccessKey;
};

log(
  'Running env '
    + chalk.green(ENV)
    + ' with config '
    + chalk.gray(JSON.stringify(conf, null, 2))
);

module.exports = conf;
