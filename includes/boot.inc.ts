(function(): void {
  function removeNode(id: string | HTMLElement): void {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    el && el.parentNode.removeChild(el);
  }

  function load(id: string | HTMLElement, cb?: Function): void {
    let el;
    if (typeof id === 'string') {
      el = document.getElementById(id);
    } else {
      el = id;
      id = '';
    }
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
      removeNode(el);
      if (id) {
        newEl.id = id;
      }

      newEl.onload = function(): void {
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

  function loadAsync(): void {
    document.querySelectorAll('script[data-async]').forEach(function(el) {
      load(el as HTMLElement);
    });
  }

  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    removeNode('main-style');
    removeNode('main-script');
    if (G.__REQUIRE_POLYFILL__) {
      load('polyfill-script', function() {
        (window as any).main.boot();
        loadAsync();
      });
    } else {
      removeNode('polyfill-script');
      (window as any).main.boot();
      loadAsync();
    }
  } else {
    load('main-style', function() {
      if (G.__REQUIRE_POLYFILL__) {
        load('polyfill-script', function() {
          load('main-script', function() {
            (window as any).main.boot();
            loadAsync();
          });
        });
      } else {
        removeNode('polyfill-script');
        load('main-script', function() {
          (window as any).main.boot();
          loadAsync();
        });
      }
    });
  }
})();
