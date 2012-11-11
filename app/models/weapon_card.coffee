Card = require 'models/card'

module.exports = class Weapon extends Card
  
  initialize: ->
    @type = 'weapon'
