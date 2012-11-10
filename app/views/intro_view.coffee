template = require 'views/templates/intro'

module.exports = class IntroView extends Backbone.View
  template: template
  className: 'intro'
  events:
    'click .play': 'onClickedPlay'

  onClickedPlay: (e) ->
    @trigger 'clickedPlay'
    e.preventDefault()
    false

  render: ->
    $('#page-container').html('')
    @$el.appendTo('#page-container')
    @$el.html(@template())