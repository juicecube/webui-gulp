const G: Record<string, any> = {
  SERVER_INJECTED_DATA: {},
  ENV: '', // inject at runtime
  BUILD_TIME: '%{{BUILD_TIME}}%',
  APP_VERSION: '%{{APP_VERSION}}%',
  BASE: '//' + location.hostname + (location.port ? ':' + location.port : ''),
};

Object.assign(G, {
  __RUNTIME_CONFIG_INJECT__: 1,
});

if (!G.cdnBase) {
  G.cdnBase = G.BASE;
}
