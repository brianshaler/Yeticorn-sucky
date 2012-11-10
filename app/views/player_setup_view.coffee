template = require 'views/templates/player_setup'

module.exports = class PlayerSetupView extends Backbone.View
  template: template
  className: 'player-setup'
  events:
    'submit form': 'submitForm'

  submitForm: (e) ->
    @trigger 'entered name'
    false

  getName: ->
    @$el.find('input[type=text]').val()

  render: ->
    $('#page-container').html('')
    @$el.appendTo('#page-container')
    @$el.html(@template())