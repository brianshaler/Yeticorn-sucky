PlayerSetupView = require 'views/player_setup_view'

# The application object
module.exports = class Application extends Backbone.Model

  initialize: ->
    @enteredName = _.once @enteredName

  start: ->
    @connectSocket()

  playerSetup: ->
    @playerSetupView = new PlayerSetupView()
    @playerSetupView.render()
    @playerSetupView.on 'entered name', =>
      @enteredName()

  connectSocket: ->
    @socket = io.connect window.location.href
    @socket.on 'intro.show', =>
      console.log 'show'
      @playerSetup()
    @socket.on 'gameSetup.show', (id) ->
      window.location.hash = id

  enteredName: ->
    @socket.emit 'playerSetup.submit', @playerSetupView.getName()