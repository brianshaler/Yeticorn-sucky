Backbone = require './backbone'
Tile = require './tile'

module.exports = class Game extends Backbone.Model
  defaults:
    gameId: ''
    tiles: []
  
  initialize: (attributes, options) ->
    @socket = options.socket
    for obj in attributes.tiles
      tile = new Tile()
      tile.positionX = obj.positionX
      tile.positionY = obj.positionY
      if obj.card
        tile.card = obj.card
      if obj.player
        tile.player = obj.player