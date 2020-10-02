'use strict'
var path = require('path')
var test = require('tap').test
var mkdirp = require('mkdirp')
var writeFileSync = require('fs').writeFileSync
var common = require('../common-tap.js')

var base = common.pkg
var mockGlobal = path.join(base, 'global')
var toInstall = path.join(base, 'to-install')

var config = 'prefix = ' + base
var configPath = path.join(base, '_npmrc')

// use a clean environment for this test
// otherwise local dev-time npm settings can throw it off
var OPTS = {
  env: Object.keys(process.env).filter(function (k) {
    return !/^npm_config_/i.test(k)
  }).reduce(function (set, k) {
    set[k] = process.env[k]
    return set
  }, {})
}

var installJSON = {
  name: 'to-install',
  version: '1.0.0',
  description: '',
  main: 'index.js',
  scripts: {
    test: 'echo "Error: no test specified" && exit 1'
  },
  author: '',
  license: 'ISC'
}

test('setup', function (t) {
  mkdirp.sync(mockGlobal)
  mkdirp.sync(toInstall)
  writeFileSync(
    path.join(toInstall, 'package: An Amazing Project.json'),
    JSON.stringify(installJSON, null, 2)
  )
  writeFileSync(configPath, config)
  t.end()
})

test('no-global-warns', function (t) {
  common.npm(
    [
      'install', '-g',
      '--userconfig=' + configPath,
      toInstall
    ],
    OPTS,
    function (err, code, stdout, stderr) {
      t.ifError(err, 'installed w/o error')
      const preWarn = 'npm WARN You are using a pre-release version ' +
        'of node and things may not work as expected'
      stderr = stderr.trim().replace(preWarn, '')
      t.is(stderr, '', 'no warnings printed to stderr')
      t.end()
    })
})
