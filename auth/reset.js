const nodemailer = require('nodemailer')
const debug = require('debug')('dat-registry')
const mockTransport = require('nodemailer-mock-transport')
const createReset = require('township-reset-password-token')
const resetPasswordHTML = require('../mailers/resetPassword')

module.exports = function (config, townshipDb) {
  const townshipReset = createReset(townshipDb, config.township)
  debug('setup mailer', config.email.smtpConfig)
  config.email.mailer = nodemailer.createTransport(config.email.smtpConfig || mockTransport())

  return {
    mail: mail,
    confirm: townshipReset.confirm
  }

  function mail (userEmail, accountKey, cb) {
    townshipReset.create({ accountKey: accountKey }, function (err, token) {
      if (err) return cb(new Error('problem creating reset token'))
      const clientHost = process.env.VIRTUAL_HOST
      ? `https://${process.env.VIRTUAL_HOST.split(',')[0]}` // can be comma separated hosts
      : 'http://localhost:8080'
      var reseturl = `${clientHost}/reset-password?accountKey=${accountKey}&resetToken=${token}&email=${userEmail}`

      var emailOptions = {
        to: userEmail,
        from: config.email.from,
        subject: 'Reset your password at datbase.org',
        html: resetPasswordHTML({reseturl: reseturl})
      }

      debug('sending mail', emailOptions)
      config.email.mailer.sendMail(emailOptions, function (err, info) {
        debug('got', err, info)
        if (err) return cb(err)
        if (config.email.mailer.transporter.name === 'Mock') {
          console.log('mock email sent', emailOptions)
        }
        cb()
      })
    })
  }
}
