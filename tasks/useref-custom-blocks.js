const fs = require('fs'),
  util = require('./util');

function _extractAttrValue(attrs, attrName) {
  let res = [];
  let r = new RegExp(
    '(?:^|\\s)' + attrName + '=([\'"])(?:\\1|(.*?[^\\\\])\\1)',
    'img'
  );
  let m;
  do {
    m = r.exec(attrs);
    if (m && m[2]) {
      res.push(m[2]);
    }
  } while (m);

  if (res.length > 1) {
    return res;
  } else {
    return res[0] || '';
  }
}

function _genId(target) {
  return 'alc-' + util.getDigest(target);
}

exports.asyncloadcss = function (content, target, attrs, alternateSearchPath) {
  let id = _genId(target);
  let onload = _extractAttrValue(attrs, 'onload');
  let onerror = _extractAttrValue(attrs, 'onerror');
  return [
    '<link rel="asyncloadcss" href="' + target + '" id="' + id + '" />',
    '<script>',
    '  (function () {',
    '    var mainStyleEl = document.getElementById("' + id + '");',
    '    var href = mainStyleEl.href;',
    '    mainStyleEl = document.createElement("link");',
    '    mainStyleEl.rel = "stylesheet";',
    '    mainStyleEl.href = href;',
    onload ? '    mainStyleEl.onload = function () {' + onload + '};' : '',
    onerror ? '    mainStyleEl.onerror = function () {' + onerror + '};' : '',
    '    document.getElementsByTagName("head")[0].appendChild(mainStyleEl);',
    '  })();',
    '</script>'
  ]
    .filter(function (line) {
      return line != '';
    })
    .join('\n');
};

exports.injectcss = function (content, target, attrs, alternateSearchPath) {
  let res = [];
  let base = process.cwd() + '/dist';
  let hrefs = _extractAttrValue(content, 'href');
  if (hrefs && !Array.isArray(hrefs)) {
    hrefs = [hrefs];
  }
  if (hrefs.length) {
    res.push('<style type="text/css">');
    hrefs.forEach(function (href) {
      href = base + href;
      res.push(fs.readFileSync(href).toString());
    });
    res.push('</style>');
  }
  return res.join('\n');
};
