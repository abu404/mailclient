const serverless = require('serverless-http');
const express = require('express')
const jwt = require('jsonwebtoken')
const cors = require('cors')
require('dotenv').config()

const mailHelper = require('./mail')
const app = express();

app.use(express.json());

const corsOptions = {
  "origin": "*",
  "methods": "GET, HEAD, PUT, PATCH, POST, DELETE",
}


app.use(cors(corsOptions))
const { INVALID_HOST, INVALID_PASS, INVALID_PORT, INVALID_USER, UNABLE_TO_GET_EMAILS } = require('./constants')
/*
- Need login route to get imap url and auth details
- for marking we will use jwt signed token and use the creds
*/

// middleware for verifying and extracting the config info from token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.JWT_SECRET, (err, userConfig) => {
    console.log(err)
    if (err) return res.sendStatus(403)
    req.config = userConfig
    next()
  })
}

app.post('/connect', async (req, res) => {
  const { host, port, user, pass } = req.body;
  const config = {
    host,
    port,
    secure: true,
    emitLogs: false,
    auth: { user, pass }
  }
  let errors = []
  if (!host.startsWith("imap"))
    errors.push(INVALID_HOST)

  if (port != "993")
    errors.push(INVALID_PORT)

  if (!user.trim().length == 0 && user.trim().includes("@") == -1)
    errors.push(INVALID_USER)

  if (pass.length == 0)
    errors.push(INVALID_PASS)

  if (errors.length > 0)
    return res.statusCode(422).json({
      success: false,
      errors
    })

  const token = jwt.sign(config, process.env.JWT_SECRET, { expiresIn: '4d' })
  return res.json({
    success: true,
    data: { token }
  })
})

app.get('/showmails', authenticateToken, async (req, res) => {
  const [status, data] = await mailHelper.fetch(req.config)
  if (!status)

    // Errors can be returned with custom errorcodes for better frontend handling. 
    // For simplicity I am returning the error message instead.
    return res.statusCode(500).json({
      success: false,
      errors: [
        UNABLE_TO_GET_EMAILS
      ]
    })
  return res.json({ data })

})
app.get('/showmail', authenticateToken, async (req, res) => {
  let seq = req.query.seq
  if (!parseInt(seq) > 0)
    return res.statusCode(422).json({
      success: false,
      errors: [
        INVALID_SEQ_ID_GIVEN
      ]
    })
  const [status, data] = await mailHelper.fetchDetails(req.config, seq)
  if (!status)
    return res.status(500).json({
      success: false,
      errors: [
        UNABLE_TO_GET_EMAIL
      ]
    })
  return res.json({ data })
})
app.get('/markasread', authenticateToken, async (req, res) => {
  let seq = req.query.seq
  if (!parseInt(seq) > 0)
    return res.status(422).json({
      success: false,
      errors: [
        INVALID_SEQ_ID_GIVEN
      ]
    })
  const [status, data] = await mailHelper.makeAsRead(req.config, seq)
  if (status == true) {
    return res.json({
      success: true,
      data
    })
  }
  return res.json({
    success: false,
    data: null
  })
})

const port = 7000
module.exports.handler = serverless(app);
// app.listen(port, () => console.log(`Running app in ${port}`))