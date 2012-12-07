express = require 'express'
http = require 'http'
socketio = require 'socket.io'
path = require 'path'
fs = require 'fs'
idgen = require 'idgen'
_ = require 'underscore'
Backbone = require 'backbone'
db = require './db'
cookie = require 'cookie'

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
    app = @
    
    player = new db.PlayerModel
      name: playerName
    
    withGame = (app, game) ->
    
    # Create Game
    game = null
    if gameId
      app.findGame gameId, (err, game) ->
        if err
          throw err
        game = app.playerJoinGame socket, player, game
    else
      game = new db.GameModel
        gameId: idgen()
        creator: player._id
      game.save (err) ->
        if err
          console.log err
        else
          app.playerJoinGame socket, player, game
    unless game
      console.log 'game not found', game
      return

  playerJoinGame: (socket, player, game) ->
    app = @
    
    if !game or !game.gameId
      console.log game
    
    app.games[game._id] = game
    app.gamesByGameId[game.gameId.toString()] = game
    
    # Create Player
    player.game = game._id
    player.save (err) ->
      if err
        console.log err
      
      app.players[player._id] = player
      
      found = false
      game.players.forEach (_player) ->
        console.log "game has #{_player._id}"
        if _player._id.toString() == player._id.toString()
          found = true
      # Add player to game
      if !found
        console.log "game doesn't yet have #{player._id}"
        game.players.push player._id
      game.save (err) ->
        if err
          throw err
        
        # Save sockets for future messages
        app.gameSockets[game.gameId] or= {}
        app.gameSockets[game.gameId][socket.id] = socket
        app.playerSockets[player._id] or= {}
        app.playerSockets[player._id][socket.id] = socket
        
        # Send message to everyone in the game
        gameSockets = app.gameSockets[game.gameId]
        playersInGame = _.map game.players, (playerId) ->
          if playerId?._id
            playerId = playerId._id
          app.players[playerId]
        game.players = playersInGame
        
        socket.emit 'player.ready', player
        app.findGame game.gameId, (err, game) ->
          _.each gameSockets, (socket) ->
            socket.emit 'game.show', game
    

  gameSetup: (event) ->
    game = @gamesByGameId[event.gameId]
    unless game
      console.log 'game not found', event.gameId
      return
    gameSockets = @gameSockets[game.gameId]
    _.each gameSockets, (socket) ->
      socket.emit 'game.created', game

  findGame: (gameId, cb) ->
    filter = gameId: gameId
    db.GameModel.find()
    .populate('players')
    .populate('creator')
    .find filter, (err, games) ->
      if games? and games.length > 0
        game = games[0]
      else
        game = null
      cb err, game

  initSockets: ->
    @io = socketio.listen @server
    @io.set 'log level', 1
    
    app = @
    @io.sockets.on 'connection', (socket) ->
      existingPlayer = false
      if socket.handshake?.headers?.cookie
        cookies = cookie.parse socket.handshake.headers.cookie
        if cookies?.playerId?.length > 0
          existingPlayer = true
          console.log 'PlayerModel.findOne {_id: '+cookies.playerId+'}'
          db.PlayerModel.findOne {_id: cookies.playerId}, (err, player) ->
            if player
              socket.emit 'player.ready', player
      socket.emit 'intro.show'
      socket.on 'player.create', (playerName, gameId) ->
        console.log 'on player.create'
        app.playerSetup socket, playerName, gameId
      socket.on 'player.join', (playerId, gameId) ->
        console.log 'on player.join'
        if playerId and playerId.length > 0
          db.PlayerModel.findOne (err, player) ->
            if err
              throw err
            if player
              app.findGame gameId, (err, game) ->
                if err
                  throw err
                if game? and game
                  app.playerJoinGame socket, player, game
                else
                  console.log 'player.join failed because gameId does not exist'
            else
              console.log 'player.join failed because playerId does not exist'
      socket.on 'game.create', (event) =>
        console.log 'on game.create'
        app.gameSetup event
      socket.on 'game.join', (playerName, gameId) =>
        console.log 'on game.join'
        app.gameSetup event
      socket.on 'game.find', (gameId) ->
        console.log 'on game.find'
        app.findGame gameId, (err, game) ->
          if err
            console.log 'ERROR'
            console.log err
            return
          if game? and game
            console.log 'emit game.found'
            console.log game
            socket.emit 'game.found', game
          else
            console.log 'emit game.notfound'
            socket.emit 'game.notfound'
      

