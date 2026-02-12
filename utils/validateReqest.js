const Joi = require('joi')
const { sendError } = require('./responseHelper')

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source] || {}
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true })
    if (error) {
      const messages = error.details.map((d) => d.message)
      return sendError(res, messages, 400)
    }
    if (source === 'body') req.body = value
    else if (source === 'params') req.params = value
    else if (source === 'query') req.query = value
    return next()
  }
}

module.exports = { validate }