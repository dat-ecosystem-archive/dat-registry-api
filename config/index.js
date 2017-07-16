const fs = require('fs')
const path = require('path')
const xtend = require('xtend')
var defaultCfg = require('../config/config.default')

module.exports = function (config) {
  config = xtend(defaultCfg, config)

  function data (configPath) {
    var datadir = config.data || process.env.DATADIR || path.join(__dirname, '..', 'data')
    return path.join(datadir, configPath)
  }

  if (config.township) {
    var ship = config.township
    ship.db = data(config.township.db)
    if (ship.publicKey) ship.publicKey = fs.readFileSync(data(ship.publicKey)).toString()
    if (ship.privateKey) ship.privateKey = fs.readFileSync(data(ship.privateKey)).toString()
  }
  if (config.db.dialect === 'sqlite3') config.db.connection.filename = data(config.db.connection.filename)
  if (config.archiver.dir === 'archiver') config.archiver.dir = data(config.archiver.dir)

  return config
}
