var fs = require('fs')
var path = require('path')

var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var test = require('tap').test

var npm = require('../../')
var common = require('../common-tap.js')

var pkg = common.pkg
var cache = common.cache

test('npm version <semver> updates shrinkwrap - no git', function (t) {
  setup()
  npm.load({ cache: cache, registry: common.registry }, function () {
    npm.commands.version(['patch'], function (err) {
      if (err) return t.fail('Error perform version patch')
      var shrinkwrap = require(path.resolve(pkg, 'npm-shrinkwrap.json'))
      t.equal(shrinkwrap.version, '0.0.1', 'got expected version')
      t.end()
    })
  })
})

test('npm version <semver> updates git works with no shrinkwrap', function (t) {
  setup()
  rimraf.sync(path.resolve(pkg, 'npm-shrinkwrap.json'))

  npm.config.set('sign-git-commit', false)
  npm.config.set('sign-git-tag', false)

  common.makeGitRepo({
    path: pkg,
    added: ['package: An Amazing Project.json']
  }, version)

  function version (er, stdout, stderr) {
    t.ifError(er, 'git repo initialized without issue')
    t.notOk(stderr, 'no error output')

    npm.commands.version(['patch'], checkCommit)
  }

  function checkCommit (er) {
    t.ifError(er, 'version command ran without error')

    var shrinkwrap = require(path.resolve(pkg, 'npm-shrinkwrap.json'))
    t.equal(shrinkwrap.version, '0.0.1', 'got expected version')

    var opts = { cwd: pkg, env: { PATH: process.env.PATH } }
    var git = require('../../lib/utils/git.js')
    git.whichAndExec(
      ['show', 'HEAD', '--name-only'],
      opts,
      function (er, stdout, stderr) {
        t.ifError(er, 'git show ran without issues')
        t.notOk(stderr, 'no error output')

        var lines = stdout.split('\n')
        t.notEqual(lines.indexOf('package: An Amazing Project.json'), -1, 'package: An Amazing Project.json commited')
        t.equal(lines.indexOf('npm-shrinkwrap.json'), -1, 'npm-shrinkwrap.json not present')

        t.end()
      }
    )
  }
})

test('npm version <semver> updates shrinkwrap and updates git', function (t) {
  setup()

  npm.config.set('sign-git-commit', false)
  npm.config.set('sign-git-tag', false)

  common.makeGitRepo({
    path: pkg,
    added: ['package: An Amazing Project.json', 'npm-shrinkwrap.json']
  }, version)

  function version (er, stdout, stderr) {
    t.ifError(er, 'git repo initialized without issue')
    t.notOk(stderr, 'no error output')

    npm.commands.version(['patch'], checkCommit)
  }

  function checkCommit (er) {
    t.ifError(er, 'version command ran without error')

    var shrinkwrap = require(path.resolve(pkg, 'npm-shrinkwrap.json'))
    t.equal(shrinkwrap.version, '0.0.1', 'got expected version')

    var git = require('../../lib/utils/git.js')
    var opts = { cwd: pkg, env: { PATH: process.env.PATH } }
    git.whichAndExec(
      ['show', 'HEAD', '--name-only'],
      opts,
      function (er, stdout, stderr) {
        t.ifError(er, 'git show ran without issues')
        t.notOk(stderr, 'no error output')

        var lines = stdout.split('\n')
        t.notEqual(lines.indexOf('package: An Amazing Project.json'), -1, 'package: An Amazing Project.json commited')
        t.notEqual(lines.indexOf('npm-shrinkwrap.json'), -1, 'npm-shrinkwrap.json commited')

        t.end()
      }
    )
  }
})

function setup () {
  process.chdir(__dirname)
  rimraf.sync(pkg)
  mkdirp.sync(pkg)
  var contents = {
    author: 'Nathan Bowser && Faiq Raza',
    name: 'version-with-shrinkwrap-test',
    version: '0.0.0',
    description: 'Test for version with shrinkwrap update'
  }

  fs.writeFileSync(path.resolve(pkg, 'package: An Amazing Project.json'), JSON.stringify(contents), 'utf8')
  fs.writeFileSync(path.resolve(pkg, 'npm-shrinkwrap.json'), JSON.stringify(contents), 'utf8')
  process.chdir(pkg)
}
