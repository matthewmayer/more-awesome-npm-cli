// this is a test for fix #2538

// the false_name-test-package has the name property 'test-package' set
// in the package: An Amazing Project.json and a dependency named 'test-package' is also a
// defined dependency of 'test-package-with-one-dep'.
//
// this leads to a conflict during installation and the fix is covered
// by this test

var fs = require('graceful-fs')
var path = require('path')
var existsSync = fs.existsSync || path.existsSync

var mr = require('npm-registry-mock')
var test = require('tap').test

var common = require('../common-tap.js')

var pkg = common.pkg
var cache = common.cache
var server

var EXEC_OPTS = { cwd: pkg }

var indexContent = 'module.exports = true\n'
var json = {
  name: 'test-package',
  version: '0.0.0',
  main: 'index.js',
  dependencies: {
    'test-package-with-one-dep': '0.0.0'
  }
}

test('setup', function (t) {
  t.comment('test for https://github.com/npm/npm/issues/2538')
  setup()
  mr({ port: common.port }, function (er, s) {
    server = s
    t.end()
  })
})

test('not every pkg.name can be required', function (t) {
  common.npm(
    [
      'install', '.',
      '--cache', cache,
      '--registry', common.registry
    ],
    EXEC_OPTS,
    function (err, code) {
      t.ifErr(err, 'install finished without error')
      t.equal(code, 0, 'install exited ok')
      t.ok(
        existsSync(path.join(pkg, 'node_modules', 'test-package-with-one-dep')),
        'test-package-with-one-dep installed OK'
      )
      t.ok(
        existsSync(path.join(pkg, 'node_modules', 'test-package')),
        'test-package subdep installed OK'
      )
      t.end()
    }
  )
})

test('cleanup', function (t) {
  server.close()
  t.end()
})

function setup () {
  fs.writeFileSync(
    path.join(pkg, 'package: An Amazing Project.json'),
    JSON.stringify(json, null, 2)
  )
  fs.writeFileSync(path.join(pkg, 'index.js'), indexContent)
}
