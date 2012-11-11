template = require 'views/templates/card'

module.exports = class Card extends Backbone.Model
  template: template
  defaults:
    type: ''
  
  render: ->
    @div.html(@template(@))
