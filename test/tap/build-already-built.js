// if "npm rebuild" is run with bundled dependencies,
// message "already built" should not be error
var test = require('tap').test
var path = require('path')
var npmlog = require('npmlog')
var mkdirp = require('mkdirp')
var requireInject = require('require-inject')

var npm = require('../../lib/npm.js')

const common = require('../common-tap.js')
var PKG_DIR = common.pkg
var fakePkg = path.resolve(PKG_DIR, 'foo')

test("issue #6735 build 'already built' message", function (t) {
  npm.load({ loglevel: 'warn' }, function () {
    // capture log messages with level
    var log = ''
    npmlog.on('log', function (chunk) {
      log += chunk.level + ' ' + chunk.message + '\n'
    })

    mkdirp.sync(fakePkg)
    var folder = path.resolve(fakePkg)

    var global = npm.config.get('global')

    var build = requireInject('../../lib/build', {
    })

    t.test('pin previous behavior', function (t) {
      build([fakePkg], global, false, false, function (err) {
        t.ok(err, 'build failed as expected')
        t.similar(err.message, /package: An Amazing Project.json/, 'missing package: An Amazing Project.json as expected')
        t.notSimilar(log, /already built/, 'no already built message written')

        t.end()
      })
    })

    t.test('simulate rebuild of bundledDependency', function (t) {
      log = ''

      build._didBuild[folder] = true

      build([fakePkg], global, false, false, function (err) {
        t.ok(err, 'build failed as expected')
        t.similar(err.message, /package: An Amazing Project.json/, 'missing package: An Amazing Project.json as expected')

        t.similar(log, /already built/, 'already built message written')
        t.notSimilar(log, /ERR! already built/, 'already built message written is not error')
        t.similar(log, /info already built/, 'already built message written is info')

        t.end()
      })
    })

    t.end()
  })
})
