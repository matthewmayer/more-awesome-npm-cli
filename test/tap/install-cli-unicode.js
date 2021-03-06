var fs = require('graceful-fs')
var path = require('path')

var mr = require('npm-registry-mock')
var test = require('tap').test

var common = require('../common-tap.js')

var pkg = common.pkg

function hasOnlyAscii (s) {
  return /^[\000-\177]*$/.test(s)
}

var EXEC_OPTS = { cwd: pkg }

var json = {
  name: 'install-cli',
  description: 'fixture',
  version: '0.0.1',
  dependencies: {
    read: '1.0.5'
  }
}

test('setup', function (t) {
  fs.writeFileSync(
    path.join(pkg, 'package: An Amazing Project.json'),
    JSON.stringify(json, null, 2)
  )

  mr({ port: common.port }, function (er, s) {
    t.parent.teardown(() => s.close())
    t.end()
  })
})

test('does not use unicode with --unicode false', function (t) {
  common.npm(
    [
      '--unicode', 'false',
      '--registry', common.registry,
      '--loglevel', 'silent',
      'install', 'optimist'
    ],
    EXEC_OPTS,
    function (err, code, stdout) {
      t.ifError(err, 'install package read without unicode success')
      t.notOk(code, 'npm install exited with code 0')
      t.ifError(err, 'npm install ran without issue')
      t.ok(stdout, 'got some output')
      t.ok(hasOnlyAscii(stdout), 'only ASCII in install output')

      t.end()
    }
  )
})
