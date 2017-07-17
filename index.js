const wrap = require('co-express')
const Dats = require('./api/dats')
const Users = require('./api/users')
const Auth = require('./auth')
const database = require('./database')
const Archiver = require('./lib/archiver')
const Config = require('./config')

module.exports = function (input) {
  var config = Config(input)
  var db = config.database || database(config)
  const archiver = config.dats || Archiver(config.archiver)
  const auth = Auth(config, db)
  var users = Users(auth, db)
  var dats = Dats(auth, db, archiver)

  wrapAll(users)
  wrapAll(dats)

  return {
    config: config,
    db: db,
    auth: auth,
    archiver: archiver,
    users: users,
    dats: dats,
    close: function (cb) {
      db.knex.destroy(function () {
        archiver.close(cb)
      })
    }
  }
}

function wrapAll (api) {
  for (let methodName of Object.getOwnPropertyNames(Object.getPrototypeOf(api))) {
    let method = api[methodName]
    if (typeof method === 'function' && methodName.charAt(0) !== '_') {
      api[methodName] = wrap(method.bind(api))
    }
  }
  return api
}
