IntroView = require 'views/intro_view'
PlayerSetupView = require 'views/player_setup_view'
GameSetupView = require 'views/game_setup_view'
GameView = require 'views/game_view'

# The application object
module.exports = class Application extends Backbone.Model

  initialize: ->
    @enteredName = _.once @enteredName
    @clickedPlay = _.once @clickedPlay

  start: ->
    @connectSocket()

  connectSocket: ->
    @socket = io.connect window.location.href
    @socket.on 'intro.show', =>
      console.log 'show'
      @intro()
    @socket.on 'gameSetup.show', (gameId) =>
      @gameId = gameId
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
    @socket.emit 'playerSetup.submit', @playerSetupView.getName()

  gameSetup: ->
    window.location.hash = @gameId
    @gameSetupView = new GameSetupView()
    @gameSetupView.render()
