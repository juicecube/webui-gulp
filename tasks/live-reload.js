const conf = require('./conf');

exports.startLiveReloadServer = function() {
  const app = require('express')();
  const http = require('http').createServer(app);
  const io = require('socket.io')(http);

  const port = conf.liveReloadPort || conf.DEFAULT_LIVE_RELOAD_PORT;

  app.get('/', function(req, res) {
    io.emit('reload', req.query.source || '');
    res.send('ok');
  });

  http.listen(port, function() {
    console.log(`LiveReload server listening on ws://127.0.0.1:${port} ...`);
  });
};
