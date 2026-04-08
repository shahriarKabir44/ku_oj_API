const { writeLog } = require("./logUtil")

const sendSuccess = (res, data = null, extra = undefined, status = 200) => {
  const body = { data: data === undefined ? null : data, errorMsg: null, hasError: false }
  if (extra !== undefined) body.extra = extra
  return res.status(status).json(body)
}

const sendError = (req, res, error = 'An error occurred', status = 200, extra = undefined) => {
  const body = { data: null, errorMsg: error, hasError: true }
  if (extra !== undefined) body.extra = extra
  writeLog(req, error);
  return res.status(status).json(body)
}

module.exports = { sendSuccess, sendError }