#!/usr/bin/env node
const database = require('./')
const admins = require('./admins')
module.exports = init

/**
 * Initializes the database.
 * @param  {[type]}   cnfig   An config.db
 * @param  {Function} cb        When done, calls cb with (err, db)
 */
function init (config, cb) {
  var db = database(config)
  db.knex.schema.hasTable('users').then(function (exists) {
    if (!exists) {
      return db.knex.schema.createTable('users', function (table) {
        table.uuid('id').primary()
        table.string('username').unique()
        table.string('email').unique()
        table.string('role').defaultTo(0)
        table.text('token')
        table.text('name')
        table.text('description')
        table.text('data')
        table.timestamp('created_at').defaultTo(db.knex.fn.now())
        table.timestamp('updated_at')
      })
    }
  })
  db.knex.schema.hasTable('dats').then(function (exists) {
    if (!exists) {
      return db.knex.schema.createTable('dats', function (table) {
        table.uuid('id').primary()
        table.uuid('user_id').references('users.id')
        table.string('name')
        table.string('url')
        table.string('title')
        table.text('description')
        table.text('keywords')
        table.timestamp('created_at').defaultTo(db.knex.fn.now())
        table.timestamp('updated_at')
        table.unique(['name', 'user_id'])
      })
    }
  }).then(function () {
    admins(db, config.admins, function (err) {
      if (err) throw err
      cb(null, db)
    })
  }).catch(function (err) {
    cb(err)
  })
}

if (!module.parent) {
  var config = require('../config.default')
  var dbPath = process.argv.slice(2)[0]
  if (dbPath) config.connection.filename = dbPath
  init(config, function (err) {
    if (err) throw err
    console.log('Successfully created tables.')
    process.exit(0)
  })
}
