mongoose = require 'mongoose'

module.exports = TileSchema = new mongoose.Schema
  gameId: String
  card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' }
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }
  positionX: Number
  positionY: Number
  cardPickup: { type: Boolean, default: false }
