var Knex = require('knex')
var Users = require('./users')
var Dats = require('./dats')

module.exports = function (config, cb) {
  console.log(config)
  if (!config.db) return cb(new Error('config.db required! Must be a knex compatible object.'))
  config.db.timezone = 'UTC'
  var knex = Knex(config.db)
  var db = {
    knex: knex,
    users: Users(knex, config),
    dats: Dats(knex, config)
  }
  return db
}
