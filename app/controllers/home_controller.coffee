Controller = require 'controllers/base/controller'
HomePageView = require 'views/home_page_view'

module.exports = class HomeController extends Controller
  historyURL: 'home'
  title: 'New Game'

  index: ->
    @view = new HomePageView()
