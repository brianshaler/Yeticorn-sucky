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
    @gamesByGameId = {}
    @players = {}

    @gameSockets = {}
    @playerSockets = {}

    @rootPath = path.dirname(path.normalize(__dirname))
    @initExpress()
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

  playerSetup: (socket, playerName, gameId) ->
    # Create Game
    game = null
    if gameId
      game = @gamesByGameId[gameId]
    else
      game = new db.GameModel
        gameId: idgen()
    unless game
      console.log 'game not found', gameId
      return
    @games[game._id] = game
    @gamesByGameId[game.gameId] = game

    # Create Player
    player = new db.PlayerModel
      name: playerName
      game: game
    @players[player._id] = player

    # Add player to game
    game.players.push player
    game.players[game.players.length - 1] = player  # do what populate would do and make it real

    # Save sockets for future messages
    @gameSockets[game.gameId] or= {}
    @gameSockets[game.gameId][socket.id] = socket
    @playerSockets[player._id] or= {}
    @playerSockets[player._id][socket.id] = socket

    # Send message to everyone in the game
    gameSockets = @gameSockets[game.gameId]
    _.each gameSockets, (socket) ->
      socket.emit 'gameSetup.show', game

  initSockets: ->
    @io = socketio.listen @server

    app = @
    @io.sockets.on 'connection', (socket) ->
      socket.emit 'intro.show'
      socket.on 'playerSetup.submit', (playerName, gameId) ->
        app.playerSetup socket, playerName, gameId
      socket.on 'gameSetup.submit', ->
        socket.emit 'game.show'
