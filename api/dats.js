var onerror = require('./onerror')
var send = require('./send')

module.exports = Dats

/**
 * Interface between API requests and the database. Validation logic for
 * the incoming request goes here. If request is valid, will dispatch to database
 * methods.
 * @param {Object} auth dat registry Auth instance
 * @param {Object} db   dat registry Database instance
 * @param {Object} archiver dat registry Archiver instance
 */
function Dats (auth, db, archiver) {
  if (!(this instanceof Dats)) return new Dats(auth, db, archiver)
  this.db = db
  this.auth = auth
  this.archiver = archiver
}

Dats.prototype._user = function (req, res, cb) {
  this.auth.currentUser(req, function (err, user) {
    if (err) return onerror(err, res)
    return cb(user)
  })
}

/**
 * POST request for the Dat model. Used to create new dats. Must be logged in.
 * Dat must be available on the network.
 * @param  {Object}   req The incoming request.
 */
Dats.prototype.post = function (req, res) {
  var self = this
  if (!req.body.name) return onerror(new Error('Name required.'), res)
  if (!req.body.url) return onerror(new Error('URL required.'), res)
  // creating a new dat. let's see if this url even makes any sense
  self._user(req, res, function (user) {
    if (!user && !user.id) return onerror(new Error('Must be logged in to do that.'), res)
    req.body.user_id = user.id
    self.archiver.get(req.body.url, function (err, archive, key) {
      if (err) return onerror(err, res)
      var timeout = req.body.timeout || 5000
      self.archiver.metadata(archive, {timeout}, function (err, info) {
        if (err) return onerror(err, res)
        self.db.dats.get({name: req.body.name, user_id: user.id}, function (err, data) {
          if (err) return onerror(err, res)
          if (data.length > 0) {
            // dat exists. updating
            self.db.dats.update({id: data[0].id}, req.body, function (err, data) {
              if (err) return onerror(err, res)
              send({updated: data}, res)
            })
          } else {
            self.db.dats.create(req.body, function (err, data) {
              if (err) return onerror(err, res)
              send(data, res, 201)
            })
          }
        })
      })
    })
  })
}

/**
 * PUT request for the Dat model. Used to update dats. Must be logged in.
 * Can only update dats that you've created.
 * @param  {[type]}   req The incoming request.
 */
Dats.prototype.put = function (req, res) {
  var self = this
  self._user(req, res, function (user) {
    if (!user) return onerror(new Error('Must be logged in to do that.'), res)
    if (!req.body.id) return onerror(new Error('id required'), res)
    self.db.dats.get({id: req.body.id}, function (err, results) {
      if (err) return onerror(err, res)
      if (!results.length) return onerror(new Error('Dat does not exist.'), res)
      if (results[0].user_id !== user.id) return onerror(new Error('Cannot update someone elses dat.'), res)
      self.db.dats.update({id: req.body.id}, req.body, function (err, data) {
        if (err) return onerror(err, res)
        send({updated: data}, res)
      })
    })
  })
}

/**
 * GET request for the Dat model. Don't need to be logged in.
 * @param  {Object}   req The incoming request.
 */
Dats.prototype.get = function (req, res) {
  var cb = function (err, data) {
    if (err) return onerror(err)
    return send(data, res)
  }
  if (req.query.search) return this.db.dats.search(req.query.search, cb)
  return this.db.dats.get(req.query, cb)
}

/**
 * DELETE request for the Dat model. Can only delete your own dats while logged in.
 * @param  {[type]}   req The incoming request.
 */
Dats.prototype.delete = function (req, res) {
  var self = this
  self._user(req, res, function (user) {
    if (!user) return onerror(new Error('Must be logged in to do that.'), res)
    self.db.dats.get({name: req.body.name, user_id: user.id}, function (err, results) {
      if (err) return onerror(err, res)
      if (!results.length) return onerror(new Error('Dat does not exist.'), res)
      if (results[0].user_id !== user.id) return onerror(new Error('Cannot delete someone elses dat.'), res)
      self.db.dats.delete({id: results[0].id}, function (err, data) {
        if (err) return onerror(err, res)
        send({deleted: data}, res)
      })
    })
  })
}
