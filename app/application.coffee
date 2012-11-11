Game = require 'models/game'
IntroView = require 'views/intro_view'
PlayerSetupView = require 'views/player_setup_view'
GameSetupView = require 'views/game_setup_view'
GameView = require 'views/game_view'

# The application object
module.exports = class Application extends Backbone.Model

  initialize: ->
    @enteredName = _.once @enteredName
    @clickedPlay = _.once @clickedPlay
    $(window).on "viewportchanged", (e) ->
      event = e.originalEvent
      window.viewportWidth = event.width
      window.viewportHeight = event.height

  start: ->
    @playerId = ''
    @viewport = new Viewporter 'outer-container'
    @connectSocket()

  connectSocket: ->
    @socket = io.connect window.location.href
    @socket.on 'intro.show', =>
      @intro()
    @socket.on 'gameSetup.show', (gameData) =>
      @gameData = gameData
      @gameSetup()

  intro: ->
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
    gameId = null
    if window.location.hash.toString().length > 1
      gameId = window.location.hash.toString().substr(1)
    @socket.on 'playerSetup.complete', (data) =>
      console.log 'playerSetup.complete'
      if data?.playerId?
        @playerId = data.playerId
        console.log data
    @socket.emit 'playerSetup.submit', @playerSetupView.getName(), gameId

  gameSetup: ->
    window.location.hash = @gameData.gameId
    @gameSetupView = new GameSetupView()
    @gameSetupView.players = @gameData.players
    @gameSetupView.render()
    @gameSetupView.on 'clickedStart', =>
      @clickedStart()

  clickedStart: ->
    @showGame()

  showGame: ->
    @model = new Game(@socket)
    @gameView = new GameView({@model})
    @model.on 'game.start', =>
      @gameView.render()
