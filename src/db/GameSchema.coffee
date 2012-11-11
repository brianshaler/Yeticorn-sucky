mongoose = require 'mongoose'

module.exports = new mongoose.Schema
  gameId: String
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }]