/* global process */

const fs = require('fs'),
  path = require('path'),
  gulp = require('../').gulp(),
  conf = require('./conf'),
  liveServer = require('live-server');

gulp.task('serve', function (done) {
  const params = {
    port: process.env.DEV_PORT || (conf.USE_HTTPS ? 443 : 80), // Set the server port. Defaults to 8080.
    host: '0.0.0.0', // Set the address to bind to. Defaults to 0.0.0.0.
    root: 'dist', // Set root directory that's being server. Defaults to cwd.
    open: true, // When false, it won't load your browser by default.
    cors: true,
    file: 'index.html', // When set, serve this file for every 404 (useful for single-page applications)
    wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
    https: conf.USE_HTTPS
      ? {
        cert: fs.readFileSync(path.join(process.cwd(), 'cert/server.crt')),
        key: fs.readFileSync(path.join(process.cwd(), 'cert/server.key'))
      }
      : null
  };
  liveServer.start(params);
  done();
});
