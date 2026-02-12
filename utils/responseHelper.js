const sendSuccess = (res, data = null, extra = undefined, status = 200) => {
  const body = { data: data === undefined ? null : data, error: null }
  if (extra !== undefined) body.extra = extra
  return res.status(status).json(body)
}

const sendError = (res, error = 'An error occurred', status = 400, extra = undefined) => {
  const body = { data: null, error }
  if (extra !== undefined) body.extra = extra
  return res.status(status).json(body)
}

module.exports = { sendSuccess, sendError }