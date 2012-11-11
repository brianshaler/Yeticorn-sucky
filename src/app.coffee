express = require 'express'
http = require 'http'
socketio = require 'socket.io'
path = require 'path'
fs = require 'fs'
idgen = require 'idgen'
_ = require 'underscore'
Backbone = require 'backbone'
db = require './db'

module.exports = class ServerApp extends Backbone.Model

  initialize: ->
    @games = {}
    @gameSockets = {}
    @players = {}
    @playerSockets = {}

    @rootPath = path.dirname(path.normalize(__dirname))
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
      @app.use express.static(path.join(@rootPath, 'public'))
      @app.use express.errorHandler()

  initMongo: ->
    app = @
    @db = db.db
    @GameModel = db.GameModel
    @PlayerModel = db.PlayerModel
    @EventModel = db.EventModel
    @CardModel = db.CardModel
    @TileModel = db.TileModel
    @eventStream = null
    @startEventStream()

  startEventStream: ->
    app = @
    @eventStream = @EventModel.find().tailable().limit(1).stream()
    @eventStream.on 'error', (err) ->
      console.error err
    @eventStream.on 'data', (event) ->
      if event.action == 'game.join'
        app.joinGame event
    #@eventStream.on 'error', (err) ->
    #  console.error err
    #  @eventStream.destroy()
    #@eventStream.on 'close', ->
    #  console.log 'Event stream closed. Starting a new one.'
    #  app.startEventStream()

  joinGame: (event) ->
    app = @
    @GameModel.findById(event.game).populate('players').exec (err, game) ->
      gameSockets = app.gameSockets[game.gameId]
      _.each gameSockets, (socket) ->
        socket.emit 'gameSetup.show', game

  initSockets: ->
    @io = socketio.listen @server

    app = @
    @io.sockets.on 'connection', (socket) ->
      socket.emit 'intro.show'
      socket.on 'playerSetup.submit', (name, gameId) ->
        gameSetup = (game) ->
          player = new app.PlayerModel
            name: name
            game: game
          player.save (err) ->
            if err
              console.error err
              return
            game.players.push player
            game.save (err) ->
              if err
                console.error err
                return
              app.games[game.gameId] = game
              app.gameSockets[game.gameId] or= {}
              app.gameSockets[game.gameId][socket.id] = socket
              app.players[player._id] = player
              app.playerSockets[player._id] or= {}
              app.playerSockets[player._id][socket.id] = socket
              event = new app.EventModel
                game: game
                player: player
                action: 'game.join'
                data:
                  playerId: player._id
                  gameId: game.gameId
              event.save()
              socket.emit 'playerSetup.complete', player
        if gameId
          app.GameModel.findOne(gameId: gameId).exec (err, game) ->
            if game and not err
              gameSetup game
        else
          game = new app.GameModel gameId: idgen()
          game.save (err) ->
            unless err
              gameSetup game
      socket.on 'gameSetup.submit', ->
        socket.emit 'game.show'
