template = require 'views/templates/player_setup'

module.exports = class PlayerSetupView extends Backbone.View
  template: template
  className: 'home-page'
  events:
    'submit form': 'submitForm'

  submitForm: (e) ->
    @trigger 'entered name'
    false

  getName: ->
    @$el.find('input[type=text]').val()

  render: ->
    @$el.appendTo('#page-container')
    @$el.html(@template())