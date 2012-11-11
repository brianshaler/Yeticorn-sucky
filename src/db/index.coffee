mongoose = require 'mongoose'
dbConfig = require './config'
GameSchema = require './GameSchema'
PlayerSchema = require './PlayerSchema'
EventSchema = require './EventSchema'
CardSchema = require './CardSchema'
TileSchema = require './TileSchema'

exports.db = mongoose.createConnection dbConfig.url
exports.GameModel = @db.model 'Game', GameSchema
exports.PlayerModel = @db.model 'Player', PlayerSchema
exports.EventModel = @db.model 'Event', EventSchema
exports.CardModel = @db.model 'Card', CardSchema
exports.TileModel = @db.model 'Tile', TieSchema