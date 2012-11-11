Card = require 'models/card'

module.exports = class Spell extends Card
  
  initialize: ->
    @type = 'spell'
