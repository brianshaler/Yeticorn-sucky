mongoose = require 'mongoose'
dbConfig = require './config'
GameSchema = require './GameSchema'
PlayerSchema = require './PlayerSchema'
EventSchema = require './EventSchema'

exports.db = mongoose.createConnection dbConfig.url
exports.GameModel = @db.model 'Game', GameSchema
exports.PlayerModel = @db.model 'Player', PlayerSchema
exports.EventModel = @db.model 'Event', EventSchema