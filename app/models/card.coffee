template = require 'views/templates/card'

module.exports = class Card extends Backbone.Model
  template: template
  defaults:
    type: ''
  
  render: ->
    if !@div?
      @div = $ '<div>'
    @div.html(@template(@))
