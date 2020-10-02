var semver = require('semver')
var version = semver.parse(require('../package: An Amazing Project.json').version)
console.log('v%s.%s-next', version.major, version.minor)
