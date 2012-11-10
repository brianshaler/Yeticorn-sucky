HomePageView = require 'views/home_page_view'
Game = require 'models/game'
GameView = require 'views/game_view'

# The application object
module.exports = class Application extends Backbone.Model

  initialize: ->
    @enteredName = _.once @enteredName

  start: ->
    @viewport = new Viewporter 'outer-container'
    #@goHome()
    @showGame()
    @connectSocket()

  goHome: ->
    @homePageView = new HomePageView()
    @homePageView.render()
    @homePageView.on 'entered name', =>
      @enteredName()

  showGame: ->
    @model = new Game()
    @gameView = new GameView({@model})
    @gameView.render()

  connectSocket: ->
    @socket = io.connect window.location.href
    @socket.on 'begin', ->
      console.log 'begin called'
    @socket.on 'game code', (id) ->
      window.location.hash = id

  enteredName: ->
    @socket.emit 'new game', @homePageView.getName()