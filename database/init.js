#!/usr/bin/env node
const database = require('./')
const admins = require('./admins')
const Config = require('../config')
module.exports = init

/**
 * Initializes the database.
 * @param  {[type]}   cfg       A config object
 * @param  {Function} cb        When done, calls cb with (err, db)
 */
function init (cfg, cb) {
  var config = Config(cfg)
  console.log('Creating tables for', config.db)
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
    if (!config.admins) {
      console.warn('Warning: Skipping admin setup, no admins specified in config.admins')
      return cb(null, db)
    }
    admins(db, config.admins, function (err) {
      if (err) throw err
      cb(null, db)
    })
  }).catch(function (err) {
    cb(err)
  })
}

if (!module.parent) {
  var config = require(process.argv.slice(2)[0] || '../config/config.default')
  init(config, function (err) {
    if (err) throw err
    console.log('Successfully created tables.')
    process.exit(0)
  })
}
