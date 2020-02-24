/* eslint-disable no-console */

(function(): void {
  function removeNode(id: string): void {
    const el = document.getElementById(id);
    el && el.parentNode.removeChild(el);
  }

  function load(id: string, cb?: Function): void {
    const el = document.getElementById(id);
    if (el) {
      let src: string, newEl: any;
      if (el.tagName === 'SCRIPT') {
        src = el.getAttribute('src');
        newEl = document.createElement('script');
        newEl.src = src;
        newEl.async = true;
      } else {
        src = el.getAttribute('href');
        newEl = document.createElement('link');
        newEl.rel = 'stylesheet';
        newEl.href = src;
      }

      newEl.onload = function(): void {
        removeNode(id);
        cb && cb();
      };

      newEl.onerror = function(): void {
        console.log('Failed to load ' + src);
        cb && cb(2);
      };

      document.body.appendChild(newEl);
    } else {
      console.log('Can not find element with id "' + id + '"');
      cb && cb(1);
    }
  }

  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    removeNode('main-style');
    removeNode('main-script');
    if (window.Promise && window.fetch) {
      removeNode('polyfill-script');
      (window as any).main.boot();
    } else {
      load('polyfill-script', function() {
        (window as any).main.boot();
      });
    }
  } else {
    load('main-style', function() {
      if (window.Promise && window.fetch) {
        removeNode('polyfill-script');
        load('main-script', function() {
          (window as any).main.boot();
        });
      } else {
        load('polyfill-script', function() {
          load('main-script', function() {
            (window as any).main.boot();
          });
        });
      }
    });
  }
})();
