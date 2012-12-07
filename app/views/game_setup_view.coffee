template = require 'views/templates/game_setup'

module.exports = class GameSetupView extends Backbone.View
  template: template
  className: 'game-setup setup'
  events:
    'click .start': 'onClickedStart'
    'submit form': 'onJoinForm'

  onClickedStart: (e) ->
    @trigger 'clickedStart'
    e.preventDefault()
    false

  onJoinForm: (e) ->
    @trigger 'joinGame'
    e.preventDefault()
    false

  getName: ->
    $('.player-name').val()

  render: ->
    $('#page-container').html('')
    @$el.appendTo('#page-container')
    $.each @players, (index, player) =>
      if player._id == @creator._id
        player.isCreator = true
      if player._id == @playerId
        player.isMe = true
    html = @template
      players: @players
      creator: @creator
      playerId: @playerId
    @$el.html html