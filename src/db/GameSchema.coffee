mongoose = require 'mongoose'

module.exports = GameSchema = new mongoose.Schema
  gameId: String
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }]
  currentPlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }
  cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cards' }]
  tiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tiles' }]

GameSchema.methods.initGame = (cb) ->
  Card = mongoose.model 'Card'
  Tile = mongoose.model 'Tile'
  
  Card.generateDeck @gameId, (err, cards) =>
    if err
      return cb err
    
    @cards = []
    for card in cards
      @cards.push card.id
    
    Tile.generateBoard @gameId, (err, tiles) =>
      if err
        return cb err
      
      @tiles = []
      for tile in tiles
        @tiles.push tile.id
      
      cb null

GameSchema.methods.startGame = (cb) ->
  Player = mongoose.model 'Player'
  
  # select first player to move
  @currentPlayer = @players[Math.floor(Math.random()*@players.length)]
  
  
  
  @save (err) ->
    cb

    
mongoose.model 'Game', GameSchema
