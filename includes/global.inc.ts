const G: Record<string, any> = {
  __REQUIRE_POLYFILL__: false,
  __COMPONENTS__: {},
  SERVER_INJECTED_DATA: {},
  ENV: '', // inject at runtime
  BUILD_TIME: '%{{BUILD_TIME}}%',
  APP_VERSION: '%{{APP_VERSION}}%',
};

Object.assign(G, {
  __RUNTIME_CONFIG_INJECT__: 1,
});

G.base = '//' + location.hostname + (location.port ? ':' + location.port : '');
if (!G.cdnBase) {
  G.cdnBase = G.base;
}
