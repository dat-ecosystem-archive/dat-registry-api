var models = require('./models')

module.exports = Users

var ROLES = {
  UNVERIFIED: '0',
  VERIFIED: '1',
  ADMIN: '2',
  SUSPENDED: '86'
}

function Users (knex, config) {
  if (!(this instanceof Users)) return new Users(knex, config)
  this.models = models(knex)
  this.admins = config.admins
  this.ROLES = ROLES
}

Users.prototype.create = function (values, cb) {
  if (this.admins.indexOf(values.username) > -1) values.role = ROLES.ADMIN
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
  if (this.admins.indexOf(values.username) > -1) values.role = ROLES.ADMIN
  this.models.users.update(where, values, cb)
}

Users.prototype.get = function (where, cb) {
  this.models.users.get(where, (err, rows) => {
    if (err) return cb(err)
    rows.map(function (user) { user.admin = (user.role === ROLES.ADMIN) })
    return cb(null, rows)
  })
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
