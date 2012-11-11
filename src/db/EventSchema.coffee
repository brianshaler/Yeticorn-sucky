{Schema} = require 'mongoose'

fields =
  game: { type: Schema.Types.ObjectId, ref: 'Game' }
  player: { type: Schema.Types.ObjectId, ref: 'Player' }
  action: String
  data: Schema.Types.Mixed

options =
  capped: 10 * 1024 * 1024

EventSchema = new Schema(fields, options)
module.exports = EventSchema