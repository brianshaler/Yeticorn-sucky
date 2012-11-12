mongoose = require 'mongoose'

module.exports = TileSchema = new mongoose.Schema
  gameId: String
  card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' }
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }
  positionX: Number
  positionY: Number
  cardPickup: { type: Boolean, default: false }

TileSchema.statics.generateBoard = (gameId, cb) ->
  Tile = mongoose.model 'Tile', TileSchema
  
  rows = 6
  cols = 9
  
  tiles = []
  for y in [0..rows]
    for x in [0..cols]
      cardPickup = if ((row+2) % 5) + ((col+2) % 5) == 0 then true else false
      tile = new Tile gameId: gameId, positionX: x, positionY: y, cardPickup: cardPickup
      tiles.push tile
      tile.save (err) ->
        if err
          cb err
          return
        tiles.push tile
  
  cb null, tiles
