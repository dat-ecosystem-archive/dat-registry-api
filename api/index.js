var Users = require('./users')
var Dats = require('./dats')
var response = require('response')
var onerror = require('./onerror')

module.exports = function api (auth, db) {
  var users = Users(auth, db)
  var dats = Dats(auth, db)
  return {
    users: gen(users),
    dats: gen(dats)
  }

  function gen (model) {
    return {
      get: done,
      post: done,
      put: done,
      delete: done
    }
    function done (req, res) {
      var route = model[req.method.toLowerCase()].bind(model)
      if (!route) return onerror(new Error('No ' + req.method + ' route.'), res)
      auth.currentUser(req, function (err, user) {
        if (err) return onerror(err, res)
        req.user = user
        route(req, function (err, data) {
          if (err) return onerror(err, res)
          return response.json(data).status(200).pipe(res)
        })
      })
    }
  }
}
