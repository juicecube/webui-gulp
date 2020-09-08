(function() {
  const port = '%{{liveReloadPort}}%' || '%{{DEFAULT_LIVE_RELOAD_PORT}}%';
  const socket = (window as any).io(`http://${location.hostname}:${port}`);
  socket.on('reload', function(source) {
    console.log(`LiveReload triggered by file change "${source}" at ${new Date().toLocaleString()}`);
    if (/\.scss$/.test(source)) {
      const oldEl = document.getElementById('main-style') as HTMLLinkElement;
      if (!oldEl) {
        return;
      }
      const el = document.createElement('link');
      el.rel = 'stylesheet';
      el.href = oldEl.href;
      el.onload = function() {
        oldEl.parentNode.removeChild(oldEl);
        el.id = 'main-style';
        el.onload = null;
        el.onerror = null;
      };
      el.onerror = function() {
        el.onload = null;
        el.onerror = null;
        el.parentNode.removeChild(el);
      };
      document.body.append(el);
    } else {
      setTimeout(location.reload.bind(location), 500);
    }
  });
})();
