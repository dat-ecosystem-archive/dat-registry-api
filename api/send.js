var response = require('response')

module.exports = function (data, res, status) {
  return response.json(data).status(status || 200).pipe(res)
}
