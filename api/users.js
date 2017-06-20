var onerror = require('./onerror')
var send = require('./send')

module.exports = Users

/**
 * Interface between API requests and the database. Validation logic for
 * the incoming request goes here. If request is valid, will dispatch to database
 * methods.
 * @param {Object} auth dat registry Auth instance.
 * @param {Object} db   dat registry Database instance.
 */
function Users (auth, db) {
  if (!(this instanceof Users)) return new Users(auth, db)
  this.auth = auth
  this.db = db
}

Users.prototype._user = function (req, res, cb) {
  this.auth.currentUser(req, function (err, user) {
    if (err) return onerror(err, res)
    return cb(user)
  })
}

/**
 * POST request on the Users model.
 * Disabled in favor of the register command on auth.
 * @param  {Object}   req The incoming request.
 */
Users.prototype.post = function (req, res) {
  return onerror(new Error('POST method not allowed'))
}

/**
 * PUT request on the Users model.
 * Update a user's profile data, requires login.
 * @param  {Object}   req The incoming request, including the user to update.
 */
Users.prototype.put = function (req, res) {
  var self = this
  self._user(req, res, function (user) {
    if (!user) return onerror(new Error('Must be logged in to do that.'))
    if (!req.body.id) return onerror(new Error('id required.'))
    if (user.role !== this.db.users.ROLES.ADMIN && user.id !== req.body.id) return onerror(new Error('You cannot update other users.'))
    self.db.users.update({id: req.body.id}, req.body, function (err, rows) {
      if (err) return onerror(err, res)
      send({updated: rows}, res)
    })
  })
}

/**
 * GET request on the Users model.
 * @param  {Object}   req The incoming request.
 */
Users.prototype.get = function (req, res) {
  var self = this
  self._user(req, res, function (user) {
    if (!user) return onerror(new Error('Must be logged in to do that.'))
    return self.db.users.get(req.query, function (err, data) {
      if (err) return onerror(err, res)
      send(data, res)
    })
  })
}

/**
 * DELETE request.
 * Verify that the user is allowed to be deleted, and then delete the user from both
 * the sql database and authentication databases.
 * @param  {Object}   req The incoming request.
 * @param  {Function} cb  The callback.
 * @return {Number}       The number of rows that were deleted.
 */
Users.prototype.delete = function (req, res) {
  var self = this
  self._user(req, res, function (user) {
    if (!user) return onerror(new Error('Must be logged in to do that.'))
    if (!req.body.id) return onerror(new Error('id required. got', req.body))
    if (user.role !== self.db.users.ROLES.ADMIN && user.id !== req.body.id) return onerror(new Error('You cannot delete other users.'))
    self.db.users.delete({id: req.body.id}, function (err, rows) {
      if (err) return onerror(err, res)
      self.auth.destroy(req, res, req.body, function (err, status, message) {
        if (err) return onerror(err, res)
        return send({deleted: rows}, res)
      })
    })
  })
}

/**
 * Verify a user's email address.
 * @param  {Object}   req The incoming request.
 * @param  {Function} cb  The callback.
 * @return {Object}       Response message.
 */
Users.prototype.verifyEmail = function (req, res) {
  var self = this
  self._user(req, res, function (user) {
    if (!user) return onerror(new Error('Must be logged in to do that.'))
    if (!req.body.id) return onerror(new Error('id required'))
    self.db.users.verifyEmail(user, req.body.verify, function (err) {
      if (err) return onerror(err, res)
      return send({verified: true}, res)
    })
  })
}
