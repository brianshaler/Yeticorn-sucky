mongoose = require 'mongoose'

module.exports = CardSchema = new mongoose.Schema
  gameId: String
  type: String

CardSchema.statics.generateDeck = (gameId, cb) ->
  Card = mongoose.model 'Card', CardSchema
  
  Card.find {}, (err, cards) =>
    if err
      return cb err
    
    if cards.length == 0
      deck = []
      
      deck.push type: 'weapon', name: 'Rusty Fork', damage: 1, description: 'poop', playCost: 0, useCost: 1
      deck.push type: 'weapon', name: 'Rusty Fork', damage: 1, description: 'poop', playCost: 0, useCost: 1
      deck.push type: 'weapon', name: 'Rusty Fork', damage: 1, description: 'poop', playCost: 0, useCost: 1
      deck.push type: 'weapon', name: 'Rusty Fork', damage: 1, description: 'poop', playCost: 0, useCost: 1
      deck.push type: 'weapon', name: 'Rusty Fork', damage: 1, description: 'poop', playCost: 0, useCost: 1
      deck.push type: 'weapon', name: 'Rusty Fork', damage: 1, description: 'poop', playCost: 0, useCost: 1
      deck.push type: 'weapon', name: 'Rusty Fork', damage: 1, description: 'poop', playCost: 0, useCost: 1
      deck.push type: 'weapon', name: 'Rusty Fork', damage: 1, description: 'poop', playCost: 0, useCost: 1
      deck.push type: 'weapon', name: 'Rusty Fork', damage: 1, description: 'poop', playCost: 0, useCost: 1
      deck.push type: 'weapon', name: 'Rusty Fork', damage: 1, description: 'poop', playCost: 0, useCost: 1
      deck.push type: 'weapon', name: 'Rusty Fork', damage: 1, description: 'poop', playCost: 0, useCost: 1
      
      count = deck.length
      for [0..count*.3]
        deck.push type: 'crystal', name: 'Crystal', damage: 0, description: 'bling bling', playCost: 0, useCost: 0
      
      for obj in deck
        card = new Card obj
        card.gameId = gameId
        card.save (err) ->
          if err
            cb err
          else
            cards.push card
    
    cb null, cards
