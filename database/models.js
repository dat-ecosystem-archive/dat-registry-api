var model = require('./model')

module.exports = function (knex) {
  return {
    dats: model(knex, 'dats', {primaryKey: 'id'}),
    users: model(knex, 'users', {primaryKey: 'id'})
  }
}
