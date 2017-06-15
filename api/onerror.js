const response = require('response')

module.exports = function onerror (err, res) {
  var data = {statusCode: 400, message: err.message}
  return response.json(data).status(400).pipe(res)
}
