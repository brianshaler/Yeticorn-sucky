template = require 'views/templates/game'

module.exports = class GameView extends Backbone.View
  template: template
  className: 'game'

  render: ->
    $('#page-container').html('')
    @$el.appendTo('#page-container')
    @$el.html(@template())