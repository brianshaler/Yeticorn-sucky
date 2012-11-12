Card = require 'models/card'

module.exports = class Crystal extends Card
  
  initialize: (params) ->
    super params
    @type = 'crystal'
    @name = 'Crystal'
    @energy = 0
    @damage = 0
    @description = 'bling bling'
    @playCost = 0
    @useCost = 0
    @filename = 'crystal'
