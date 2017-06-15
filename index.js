const Api = require('./api')
const Auth = require('./auth')
const database = require('./database')

module.exports = function (config) {
  var db = config.database || database(config.db)
  const auth = Auth(config, db)
  const api = Api(auth, db)

  return {
    db: db,
    users: api.users,
    dats: api.dats,
    auth: auth,
    close: function (cb) {
      db.knex.destroy(cb)
    }
  }
}
