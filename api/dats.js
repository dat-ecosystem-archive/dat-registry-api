module.exports = Dats

/**
 * Interface between API requests and the database. Validation logic for
 * the incoming request goes here. If request is valid, will dispatch to database
 * methods.
 * @param {[type]} auth dat registry Auth instance
 * @param {[type]} db   dat registry Database instance
 */
function Dats (auth, db) {
  if (!(this instanceof Dats)) return new Dats(auth, db)
  this.db = db
  this.auth = auth
}

/**
 * POST request for the Dat model. Used to create new dats. Must be logged in.
 * @param  {[type]}   req The incoming request.
 */
Dats.prototype.post = function (req, cb) {
  var self = this
  if (!req.user && !req.user.id) return cb(new Error('Must be logged in to do that.'))
  if (!req.body.name) return cb(new Error('Name required.'))
  req.body.user_id = req.user.id
  self.db.dats.get({name: req.body.name, user_id: req.user.id}, function (err, data) {
    if (err) return cb(err)
    if (data.length > 0) {
      self.db.dats.update({id: data[0].id}, req.body, function (err, data) {
        if (err) return cb(err)
        cb(null, {updated: data})
      })
    } else self.db.dats.create(req.body, cb)
  })
}

/**
 * PUT request for the Dat model. Used to update dats. Must be logged in.
 * Can only update dats that you've created.
 * @param  {[type]}   req The incoming request.
 */
Dats.prototype.put = function (req, cb) {
  var self = this
  if (!req.user) return cb(new Error('Must be logged in to do that.'))
  if (!req.body.id) return cb(new Error('id required'))
  self.db.dats.get({id: req.body.id}, function (err, results) {
    if (err) return cb(err)
    if (!results.length) return cb(new Error('Dat does not exist.'))
    if (results[0].user_id !== req.user.id) return cb(new Error('Cannot update someone elses dat.'))
    self.db.dats.update({id: req.body.id}, req.body, function (err, data) {
      if (err) return cb(err)
      cb(null, {updated: data})
    })
  })
}

/**
 * GET request for the Dat model.
 * @param  {[type]}   req The incoming request.
 */
Dats.prototype.get = function (req, cb) {
  return this.db.dats.get(req.query, cb)
}

/**
 * DELETE request for the Dat model. Can only delete your own dats while logged in.
 * @param  {[type]}   req The incoming request.
 */
Dats.prototype.delete = function (req, cb) {
  var self = this
  if (!req.user) return cb(new Error('Must be logged in to do that.'))
  self.db.dats.get({name: req.body.name, user_id: req.user.id}, function (err, results) {
    if (err) return cb(err)
    if (!results.length) return cb(new Error('Dat does not exist.'))
    if (results[0].user_id !== req.user.id) return cb(new Error('Cannot delete someone elses dat.'))
    self.db.dats.delete({id: results[0].id}, function (err, data) {
      if (err) return cb(err)
      cb(null, {deleted: data})
    })
  })
}
