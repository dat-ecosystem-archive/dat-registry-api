module.exports = function (db, admins, cb) {
  if (!Array.isArray(admins)) return cb(new Error('Admins must be an array of usernames.'))
  admins = admins.map((name) => `"${name}"`)
  var query = 'UPDATE users set role=2 WHERE username is ' + admins.join(' OR username is ')
  db.knex.raw(query).then(() => cb()).catch(cb)
}
