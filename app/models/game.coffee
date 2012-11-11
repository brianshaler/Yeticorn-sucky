module.exports = class Game extends Backbone.Model
  defaults:
    gameId: ''
    tiles: []
  
  initialize: (@socket) ->
  #@socket.emit 'game.hello', @attributes.gameId
    