Game = require 'models/game'
IntroView = require 'views/intro_view'
PlayerSetupView = require 'views/player_setup_view'
GameSetupView = require 'views/game_setup_view'
GameView = require 'views/game_view'

# The application object
module.exports = class Application extends Backbone.Model

  initialize: ->
    @playerId = ''
    @gameId = ''
    @cookieId = Cookie.get 'playerId'
    @enteredName = _.once @enteredName
    @clickedPlay = _.once @clickedPlay
    @clickedStart = _.once @clickedStart
    
    if window.location.hash.toString().length > 1
      @gameId = window.location.hash.toString().substr(1)
    @setupWindow()

  setupWindow: ->
    $(window).on "viewportchanged", (e) ->
      event = e.originalEvent
      window.viewportWidth = event.width
      window.viewportHeight = event.height
    
    @tileWidth = 240
    @tileHeight = 210
    Handlebars.registerHelper 'positionLeft', (tile) =>
      tile.attributes.positionX * (@tileWidth * .75)
    Handlebars.registerHelper 'positionTop', (tile) =>
      (tile.attributes.positionY + (if tile.attributes.positionX % 2 == 0 then 0.5 else 0)) * @tileHeight

  start: ->
    @viewport = new Viewporter 'outer-container'
    @connectSocket()

  connectSocket: ->
    @socket = io.connect window.location.href
    
    @socket.on 'intro.show', =>
      @intro()
    @socket.on 'game.show', @receiveGameData
    @socket.on 'game.found', @receiveGameData
    @socket.on 'game.notfound', (data) =>
      console.log "Game not found!"
      window.location.hash = ""
      @showIntro()
    @socket.on 'player.ready', (data) =>
      if data?._id? and data._id
        @playerId = data._id
        console.log 'setting cookie playerId='+@playerId
        Cookie.set 'playerId', @playerId, 24*365*5

  intro: ->
    if @gameId.length > 0
      console.log "look up gameId #{@gameId}"
      @socket.emit 'game.find', @gameId
    else
      console.log "Just show intro #{window.location.hash}"
      @showIntro()

  showIntro: ->
    @introView = new IntroView
    @introView.render()
    @introView.on 'clickedPlay', =>
      @clickedPlay()

  clickedPlay: ->
    @playerSetup()

  playerSetup: ->
    @playerSetupView = new PlayerSetupView()
    @playerSetupView.render()
    @playerSetupView.on 'entered name', =>
      @enteredName()

  enteredName: ->
    @socket.emit 'player.create', @playerSetupView.getName(), @gameId

  receiveGameData: (gameData) =>
    @gameData = gameData
    console.log @gameData
    if @cookieId and @gameData.gameId
      @socket.emit 'player.join', @cookieId, @gameData.gameId
      @cookieId = ''
      @socket.on 'player.joined', ->
        @gameSetup()
    else
      @gameSetup()

  gameSetup: ->
    window.location.hash = @gameData.gameId
    @gameSetupView = new GameSetupView()
    @gameSetupView.players = @gameData.players
    @gameSetupView.playerId = @playerId
    @gameSetupView.creator = @gameData.creator
    @gameSetupView.render()
    @gameSetupView.on 'clickedStart', =>
      @clickedStart()
    @gameSetupView.on 'joinGame', =>
      @socket.emit 'player.create', @gameSetupView.getName(), @gameId

  clickedStart: ->
    @socket.emit 'game.create', {gameId: @gameData.gameId}
    @socket.on 'game.complete', (game) =>
      @showGame(game)

  showGame: (gameData) ->
    @model = new Game(gameData, {socket: @socket})
    @gameView = new GameView({@model})
    @model.on 'game.started', @gameView.init
    @model.on 'game.rerender', @gameView.init
    @model.init()
