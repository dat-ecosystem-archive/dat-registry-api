const mkdirp = require('mkdirp')
const encoding = require('dat-encoding')
const hyperhealth = require('hyperhealth')
const debug = require('debug')('dat-registry')
const ram = require('random-access-memory')
const resolve = require('dat-link-resolve')
const hyperdrive = require('hyperdrive')
const archiver = require('hypercore-archiver')
const swarm = require('hypercore-archiver/swarm')

module.exports = Archiver

function Archiver (opts) {
  if (!(this instanceof Archiver)) return new Archiver(opts)
  var dir = opts.dir
  this.opts = opts
  mkdirp.sync(dir)
  this.ar = archiver(dir, {sparse: true})
  this.swarm = swarm(this.ar, {udp: false})
}

Archiver.prototype.health = function (archive) {
  var health = archive.health.get()
  if (!health) return
  health.completedPeers = health.peers ? health.peers.filter(peer => {
    return peer.have === peer.length
  }) : []
  health.progressPeers = health.peers ? health.peers.filter(peer => {
    return peer.have !== peer.length
  }) : []
  debug('got health', health)
  return health
}

Archiver.prototype.get = function (link, opts, cb) {
  var self = this
  debug('archiver getting', link)
  if (typeof opts === 'function') return this.get(link, {}, opts)
  resolve(link, function (err, key) {
    if (err) {
      console.trace(err)
      return cb(new Error('Invalid key'))
    }
    var buf = encoding.toBuf(key)
    debug('got key', key)
    self.ar.get(buf, function (err, metadata, content) {
      if (!err) {
        debug('found hyperdrive', key)
        var archive = hyperdrive(ram, {metadata, content})
        archive.health = hyperhealth(archive)
        return cb(null, archive, key)
      }
      if (err.message === 'Could not find feed') {
        debug('could not find feed, trying again', key)
        self.ar.add(buf, function (err) {
          if (err) return cb(err)
          return self.get(buf, opts, cb)
        })
      } else return cb(err)
    })
  })
}

Archiver.prototype.metadata = function (archive, opts, cb) {
  var self = this
  debug('getting metadata for', archive.key)
  if (typeof opts === 'function') return self.metadata(archive, {}, opts)
  var dat = {}
  var cancelled = false

  var timeout = setTimeout(function () {
    if (dat.entries) return done(null, dat)
    var msg = 'timed out'
    debug(msg, dat)
    return done(new Error(msg), dat)
  }, parseInt(opts.timeout))

  function done (err, dat) {
    clearTimeout(timeout)
    if (cancelled) return
    cancelled = true
    return cb(err, dat)
  }
  archive.metadata.update()
  archive.tree.list('/', {nodes: true}, function (err, entries) {
    if (err) {
      debug('updating metadata')
      return archive.metadata.update(function () {
        if (cancelled) return
        cancelled = true
        self.metadata(archive, opts, cb)
      })
    }
    if (cancelled) return done(null, dat)

    debug('got', entries.length, 'entries')
    for (var i in entries) {
      var entry = entries[i]
      entries[i] = entry.value
      entries[i].name = entry.name
      entries[i].type = 'file'
    }
    dat.entries = entries
    var filename = 'dat.json'
    archive.stat(filename, function (err, entry) {
      if (err || cancelled) return done(null, dat)
      archive.readFile(filename, function (err, metadata) {
        if (err || cancelled) return done(null, dat)
        try {
          dat.metadata = metadata ? JSON.parse(metadata.toString()) : undefined
        } catch (e) {
          err = new Error('dat.json file malformed')
        }
        dat.size = archive.content.byteLength
        return done(err, dat)
      })
    })
  })
}

Archiver.prototype.close = function (cb) {
  this.swarm.destroy(cb)
}
