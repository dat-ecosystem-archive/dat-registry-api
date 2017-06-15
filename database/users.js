var models = require('./models')

module.exports = Users

var ROLES = {
  UNVERIFIED: 0,
  VERIFIED: 1,
  ADMIN: 2
}

function Users (knex) {
  if (!(this instanceof Users)) return new Users(knex)
  this.models = models(knex)
  this.ROLES = ROLES
}

Users.prototype.create = function (values, cb) {
  this.models.users.create(values, cb)
}

/**
 * Update a user from the sql database.
 * @param  {Object}   where The query parameters to define which rows to update.
 * @param  {Object}   values The values to update.
 * @param  {Function} cb  The callback.
 * @return {Number}       The number of rows that were updated.
 */
Users.prototype.update = function (where, values, cb) {
  this.models.users.update(where, values, cb)
}

Users.prototype.get = function (where, cb) {
  this.models.users.get(where, cb)
}

/**
 * Delete a user from the sql database.
 * @param  {Object}   query The incoming request.
 * @param  {Function} cb  The callback.
 * @return {Number}       The number of rows that were deleted.
 */
Users.prototype.delete = function (query, cb) {
  if (!query.id) return cb(new Error('id required.'))
  this.models.users.delete({id: query.id}, cb)
}

/**
 * Verify a user's email address.
 * @param  {Object}   req The incoming request
 * @param  {Function} cb  The callback.
 */
Users.prototype.verifyEmail = function (user, verifyToken, cb) {
  if (verifyToken !== user.verifyToken) return cb(new Error('Invalid verification token.'))
  this.db.users.update({id: user.id}, {role: ROLES.VERIFIED}, function (err, data) {
    if (err) return cb(err)
    return cb(null, {verified: true})
  })
}
