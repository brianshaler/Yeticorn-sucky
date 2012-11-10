express = require 'express'
path = require 'path'
fs = require 'fs'

module.exports = app = express()

app.set 'port', process.env.PORT or 8000
app.use express.favicon()
app.use express.logger('dev')
app.use express.bodyParser()
app.use express.methodOverride()
app.use app.router
app.use express.static(path.join(process.cwd(), 'public'))
app.use express.errorHandler()