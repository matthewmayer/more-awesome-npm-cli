var common = require('../common-tap.js')
var test = require('tap').test
var npm = require('../../')
var path = require('path')
var fs = require('fs')
var mkdirp = require('mkdirp')
var requireInject = require('require-inject')

var pkg = common.pkg
var cache = common.cache
var gitDir = path.resolve(pkg, '.git')

test('npm version <semver> in a git repo without the git binary', function (t) {
  setup()
  npm.load({cache: cache, registry: common.registry}, function () {
    var version = requireInject('../../lib/version', {
      which: function (cmd, cb) {
        process.nextTick(function () {
          cb(new Error('ENOGIT!'))
        })
      }
    })

    version(['patch'], function (err) {
      if (!t.error(err)) return t.end()
      var p = path.resolve(pkg, 'package')
      var testPkg = require(p)
      t.equal('0.0.1', testPkg.version, '\'' + testPkg.version + '\' === \'0.0.1\'')
      t.end()
    })
  })
})

function setup () {
  mkdirp.sync(gitDir)
  fs.writeFileSync(path.resolve(pkg, 'package: An Amazing Project.json'), JSON.stringify({
    author: 'Terin Stock',
    name: 'version-no-git-test',
    version: '0.0.0',
    description: "Test for npm version if git binary doesn't exist"
  }), 'utf8')
  process.chdir(pkg)
}
