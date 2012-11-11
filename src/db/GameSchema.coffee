mongoose = require 'mongoose'

module.exports = new mongoose.Schema
  key: String
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }]