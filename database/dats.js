var models = require('./models')

module.exports = Dats

function Dats (knex) {
  if (!(this instanceof Dats)) return new Dats(knex)
  this.knex = knex
  this.models = models(knex)
}

/**
 * Create a dat in the database.
 * @param  {Object}   values The values of the new dat
 * @param  {Function} cb     The callback.
 * @return {Object}          The dat as it appears in the database.
 */
Dats.prototype.create = function (values, cb) {
  this.models.dats.create(values, cb)
}

/**
 * Update a dat in the database.
 * @param  {Object}   where The query parameters to define which rows to update.
 * @param  {Object}   values The values to update.
 * @param  {Function} cb    The callback.
 * @return {Number}         Number of rows updated.
 */
Dats.prototype.update = function (where, values, cb) {
  if (!where.id) return cb(new Error('id required'))
  this.models.dats.update({id: where.id}, values, cb)
}

Dats.prototype.get = function (where, cb) {
  this.models.dats.get(where, cb)
}

/**
 * Delete a dat from the database.
 * @param  {Object}   where A dictionary of params for deletion, id key required.
 * @param  {Function} cb    The callback.
 * @return {Number}         Number of rows deleted.
 */
Dats.prototype.delete = function (where, cb) {
  if (!where.id) return cb(new Error('id required'))
  this.models.dats.delete(where, cb)
}

/**
 * Get dats given their shortname -- username and dataset name.
 * TODO: make this method use underlying SQL for better performance.
 * @param  {Object}   params Username and dataset name.
 * @param  {Function} cb     The callback.
 * @return {Object}          The dat published by that username and dataset name.
 */
Dats.prototype.getByShortname = function (params, cb) {
  var self = this
  self.models.users.get({username: params.username}, function (err, results) {
    if (err) return cb(err)
    if (!results.length) return cb(new Error('Username not found.'))
    var user = results[0]
    self.models.dats.get({user_id: user.id, name: params.dataset}, function (err, results) {
      if (err) return cb(err)
      if (!results.length) return cb(new Error('Dat with that name not found.'))
      var dat = results[0]
      return cb(null, dat)
    })
  })
}

/**
 * Gives a list of all dats with the corresponding user names
 * @param  {Function} cb     The callback.
 * @return {Array}          List of dats.
 */
Dats.prototype.list = function (params, cb) {
  this.knex.raw('SELECT users.username, dats.id, dats.url, dats.name, dats.created_at from dats inner join users on dats.user_id=users.id')
  .then(function (resp) {
    cb(null, resp)
  })
  .catch(cb)
}
