template = require 'views/templates/card'

module.exports = class Card extends Backbone.Model
  template: template
  defaults:
    type: ''
  
  initialize: (params) ->
    for key, val of params
      @[key] = val

  render: ->
    if !@div?
      @div = $ '<div>'
    @div.html(@template(@))
