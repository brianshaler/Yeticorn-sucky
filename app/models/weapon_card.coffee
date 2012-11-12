Card = require 'models/card'

module.exports = class Weapon extends Card
  
  initialize: (params) ->
    super params
    @type = 'weapon'
