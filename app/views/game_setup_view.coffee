template = require 'views/templates/game_setup'

module.exports = class GameSetupView extends Backbone.View
  template: template
  className: 'game-setup setup'
  events:
    'click .start': 'onClickedStart'

  onClickedStart: (e) ->
    @trigger 'clickedStart'
    e.preventDefault()
    false

  render: ->
    $('#page-container').html('')
    @$el.appendTo('#page-container')
    html = @template
      players: @players
    @$el.html html