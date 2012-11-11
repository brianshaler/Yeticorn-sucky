Card = require 'models/card'

module.exports = class Crystal extends Card
  
  initialize: ->
    @type = 'crystal'
    @energy = 0
