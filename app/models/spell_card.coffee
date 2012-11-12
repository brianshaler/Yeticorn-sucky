Card = require 'models/card'

module.exports = class Spell extends Card
  
  initialize: (params) ->
    super params
    @type = 'spell'
