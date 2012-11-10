Controller = require 'controllers/base/controller'
HomePageView = require 'views/home_page_view'
_ = require 'underscore'
Chaplin = require 'chaplin'

module.exports = class HomeController extends Controller
  historyURL: 'home'
  title: 'New Game'

  initialize: ->
    @enteredName = _.once @enteredName

  index: ->
    @view = new HomePageView()
    @view.on 'entered name', @enteredName, this

  enteredName: () ->
    Chaplin.socket.on 'game code', (id) =>
      @invite id
    Chaplin.socket.emit 'new game'

  invite: (id) ->
    window.location.hash = id