const G: Record<string, any> = {
  __REQUIRE_POLYFILL__: false,
  __ERROR_QUEUE__: [],
  __COMPONENTS__: {},
  SERVER_INJECTED_DATA: {},
  ASYNC_SCRIPT_PROMISE: {},
  ENV: '', // inject at runtime
  BUILD_TIME: '%{{BUILD_TIME}}%',
  APP_VERSION: '%{{APP_VERSION}}%',
};

(function() {
  const runtimeConfig = {
    __RUNTIME_CONFIG_INJECT__: 1,
  };

  for (const p in runtimeConfig) {
    if (Object.prototype.hasOwnProperty.call(runtimeConfig, p)) {
      G[p] = runtimeConfig[p];
    }
  }
})();

G.base = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
if (!G.cdnBase) {
  G.cdnBase = G.base;
}
