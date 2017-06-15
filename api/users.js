module.exports = Users

/**
 * Interface between API requests and the database. Validation logic for
 * the incoming request goes here. If request is valid, will dispatch to database
 * methods.
 * @param {[type]} auth dat registry Auth instance
 * @param {[type]} db   dat registry Database instance
 */
function Users (auth, db) {
  if (!(this instanceof Users)) return new Users(auth, db)
  this.auth = auth
  this.db = db
}

/**
 * POST request on the Users model.
 * Disabled in favor of the register command on auth.
 * @param  {[type]}   req The incoming request.
 */
Users.prototype.post = function (req, cb) {
  return cb(new Error('POST method not allowed'))
}

/**
 * PUT request on the Users model.
 * Update a user's profile data, requires
 * @param  {[type]}   req The incoming request, including the user to update.
 */
Users.prototype.put = function (req, cb) {
  if (!req.user) return cb(new Error('Must be logged in to do that.'))
  if (!req.body.id) return cb(new Error('id required.'))
  if (req.user.role !== this.db.users.ROLES.ADMIN && req.user.id !== req.body.id) return cb(new Error('You cannot update other users.'))
  this.db.users.update({id: req.body.id}, req.body, function (err, data) {
    if (err) return cb(err)
    cb(null, {updated: data})
  })
}

/**
 * GET request on the Users model.
 * @param  {[type]}   req The incoming request.
 */
Users.prototype.get = function (req, cb) {
  if (!req.user) return cb(new Error('Must be logged in to do that.'))
  return this.db.users.get(req.query, cb)
}

/**
 * DELETE request.
 * Verify that the user is allowed to be deleted, and then delete the user from both
 * the sql database and authentication databases.
 * @param  {[type]}   req The incoming request.
 * @param  {Function} cb  The callback.
 * @return {[type]}       The number of rows that were deleted.
 */
Users.prototype.delete = function (req, cb) {
  var self = this
  if (!req.user) return cb(new Error('Must be logged in to do that.'))
  if (!req.body.id) return cb(new Error('id required. got', req.body))
  if (req.user.role !== self.db.users.ROLES.ADMIN && req.user.id !== req.body.id) return cb(new Error('You cannot delete other users.'))
  self.auth.currentUser(req, function (err, user) {
    if (err) return cb(err)
    req.user = user
    self.db.users.delete({id: req.body.id}, function (err, data) {
      if (err) return cb(err)
      self.auth.destroy(req, null, req, function (err, status, message) {
        if (err) return cb(err)
        return cb(null, {deleted: data})
      })
    })
  })
}

/**
 * Verify a user's email address.
 * @param  {[type]}   req The incoming request
 * @param  {Function} cb  [description]
 * @return {[type]}       [description]
 */
Users.prototype.verifyEmail = function (req, cb) {
  var self = this
  if (!req.user) return cb(new Error('Must be logged in to do that.'))
  if (!req.body.id) return cb(new Error('id required'))
  self.db.users.verifyEmail(req.user, req.body.verify, cb)
}
