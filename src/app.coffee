express = require 'express'
http = require 'http'
socketio = require 'socket.io'
path = require 'path'
fs = require 'fs'

app = exports.app = express()
server = exports.server = http.createServer(app)
io = exports.io = socketio.listen server

app.configure ->
  app.set 'port', process.env.PORT or 8000
  app.use express.favicon()
  app.use express.logger('dev')
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use app.router
  app.use express.static(path.join(process.cwd(), 'public'))

app.configure 'development', ->
  app.use express.errorHandler()

io.sockets.on 'connection', (socket) ->
  socket.emit 'begin'
  socket.on 'new game', (name) ->
    socket.emit 'invite code', 'todo: generate codes'