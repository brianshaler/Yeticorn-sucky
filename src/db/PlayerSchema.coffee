mongoose = require 'mongoose'

module.exports = new mongoose.Schema
  _game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' }
  name: String