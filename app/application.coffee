HomePageView = require 'views/home_page_view'

# The application object
module.exports = class Application extends Backbone.Model

  initialize: ->
    @enteredName = _.once @enteredName

  start: ->
    @goHome()
    @connectSocket()

  goHome: ->
    @homePageView = new HomePageView()
    @homePageView.render()
    @homePageView.on 'entered name', =>
      @enteredName()

  connectSocket: ->
    @socket = io.connect window.location.href
    @socket.on 'begin', ->
      console.log 'begin called'
    @socket.on 'game code', (id) ->
      window.location.hash = id

  enteredName: ->
    @socket.emit 'new game', @homePageView.getName()