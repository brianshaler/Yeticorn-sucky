mongoose = require 'mongoose'

module.exports = GameSchema = new mongoose.Schema
  gameId: String
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }]
  cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cards' }]

GameSchema.methods.init = (cb) ->
  Card = mongoose.model 'Card'
  
  Card.generateDeck @gameId, (err, card) =>
    if err
      return cb err
    
    this.cards = []
    for card in cards
      this.cards.push card.id
    
    cb null
