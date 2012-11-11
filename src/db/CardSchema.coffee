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
      
      deck.push type: 'weapon', name: 'Spork', damage: 1, description: 'The Spork can rip out your opponents eyes leaving them blind', playCost: 1, useCost : 1
      deck.push type: 'weapon', name: 'Shuriken', damage: 2, description: 'Aim for the jugular of your opponent with this powerful weapon', playCost: 2, useCost : 2
      deck.push type: 'weapon', name: 'Frying Pan', damage: 3, description: 'Stolen from the kitchen of a mad chef the magical Frying Pan is bloody', playCost: 3, useCost : 2
      deck.push type: 'weapon', name: 'Ray Gun', damage: 4, description: 'Set the Ray Gun to stun to freeze and hurt your opponent', playCost: 3, useCost : 3
      deck.push type: 'weapon', name: 'Bowling Ball', damage: 4, description: 'Be sure to throw this directly at the unicorn', playCost: 4, useCost :4
      deck.push type: 'weapon', name: 'Scissors', damage: 5, description: 'Be sure to RUN with Scissors before and after cutting off your opponents ear', playCost: 5, useCost : 5
      deck.push type: 'weapon', name: 'Axe', damage: 6, description: 'Strike hard and fast with the powerful axe', playCost: 6, useCost : 6
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
