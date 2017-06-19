const Api = require('./api')
const Auth = require('./auth')
const database = require('./database')
const Archiver = require('./archiver')

module.exports = function (config) {
  var db = config.database || database(config.db)
  const auth = Auth(config, db)
  const api = Api(auth, db)
  const archiver = config.dats || Archiver(config.archiver)

  return {
    db: db,
    archiver: archiver,
    users: api.users,
    dats: api.dats,
    auth: auth,
    close: function (cb) {
      db.knex.destroy(function () {
        archiver.close(cb)
      })
    }
  }
}
