module.exports = class Game extends Backbone.Model
  defaults:
    gameId: ''
    tiles: []
  
  initialize: (@socket) ->
    @socket.on 'game.boardSetup', (data) =>
      for obj in data
        tile = new Tile()
        tile.positionX = obj.positionX
        tile.positionY = obj.positionY
        if obj.card
          tile.card = obj.card
        if obj.player
          tile.player = obj.player
      
      @trigger 'game.start'
        
    
    
    