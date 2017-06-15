var models = require('./models')

module.exports = Dats

function Dats (knex) {
  if (!(this instanceof Dats)) return new Dats(knex)
  this.knex = knex
  this.models = models(knex)
}

Dats.prototype.create = function (values, cb) {
  this.models.dats.create(values, cb)
}

Dats.prototype.update = function (where, values, cb) {
  if (!where.id) return cb(new Error('id required'))
  this.models.dats.update({id: where.id}, values, cb)
}

Dats.prototype.get = function (where, cb) {
  this.models.dats.get(where, cb)
}

Dats.prototype.delete = function (where, cb) {
  if (!where.id) return cb(new Error('id required'))
  this.models.dats.delete(where, cb)
}

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

Dats.prototype.list = function (params, cb) {
  this.knex.raw('SELECT users.username, dats.id, dats.url, dats.name, dats.created_at from dats inner join users on dats.user_id=users.id')
  .then(function (resp) {
    cb(null, resp)
  })
  .catch(cb)
}
