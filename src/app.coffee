express = require 'express'
http = require 'http'
socketio = require 'socket.io'
path = require 'path'
fs = require 'fs'
idgen = require 'idgen'
Backbone = require 'backbone'
mongoose = require 'mongoose'
dbConfig = require './db/config'
GameSchema = require './db/GameSchema'
PlayerSchema = require './db/PlayerSchema'

module.exports = class ServerApp extends Backbone.Model

  initialize: ->
    @initExpress()
    @initMongo()
    @initSockets()

  initExpress: ->
    @app = express()
    @server = http.createServer(@app)

    @app.configure =>
      @app.set 'port', process.env.PORT or 8000
      @app.use express.favicon()
      @app.use express.logger('dev')
      @app.use express.bodyParser()
      @app.use express.methodOverride()
      @app.use @app.router
      @app.use express.static(path.join(process.cwd(), 'public'))

    @app.configure 'development', =>
      @app.use express.errorHandler()

  initMongo: ->
    console.log dbConfig.url
    @db = mongoose.createConnection dbConfig.url
    @GameModel = @db.model 'Game', GameSchema
    @PlayerModel = @db.model 'Player', PlayerSchema

  initSockets: ->
    @io = socketio.listen @server

    app = @
    @io.sockets.on 'connection', (socket) ->
      socket.emit 'intro.show'
      socket.on 'playerSetup.submit', (name) ->
        game = new app.GameModel key: idgen()
        game.save (err) ->
          unless err
            socket.emit 'gameSetup.show', game.key
      socket.on 'gameSetup.submit', ->
        socket.emit 'game.show'