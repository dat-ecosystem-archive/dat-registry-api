var Knex = require('knex')
var Users = require('./users')
var Dats = require('./dats')

module.exports = function (opts, cb) {
  if (!opts) opts = {}
  opts.timezone = 'UTC'
  var knex = Knex(opts)
  var db = {
    knex: knex,
    users: Users(knex),
    dats: Dats(knex)
  }
  return db
}
