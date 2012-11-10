template = require 'views/templates/game_setup'

module.exports = class GameSetupView extends Backbone.View
  template: template
  className: 'game-setup setup'

  render: ->
    $('#page-container').html('')
    @$el.appendTo('#page-container')
    @$el.html(@template())