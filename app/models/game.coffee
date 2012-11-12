Backbone = require './backbone'
Tile = require './tile'
Player = require './player'
Crystals = require 'models/crystals'

Weapon = require 'models/weapon_card'
Crystal = require 'models/crystal_card'
Spell = require 'models/spell_card'

module.exports = class Game extends Backbone.Model
  defaults:
    gameId: ''
  
  initialize: (@socket) ->
    playerNames = ['@brianshaler', '@batkin', '@bobrox', '@johnmurch']
    colors = ['blue', 'yellow', 'orange', 'gray']
    @players = []
    for i in [0..playerNames.length-1]
      player = new Player playerNames[i]
      player.color = colors[i]
      @players.push player
    
    console.log @players
    
    @meId = @currentPlayerId = Math.floor(Math.random()*@players.length)
    @currentPlayer = @players[@currentPlayerId]
    @me = @currentPlayer
    @tiles = []
    @cards = []
    @deck = []
    
    @generateMap()
    @generateDeck()
    @cardsOnBoard()
    @dealCards()
    @placePlayers()
  
  init: =>
    @trigger 'game.started'
  
  generateMap: ->
    mapRows = 6
    mapCols = 10
    for row in [0..mapRows]
      for col in [0..mapCols]
        tile = new Tile()
        cardPickup = if ((row+1) % 2) + ((col+1) % 3) == 0 then true else false
        tile.update positionX: col, positionY: row, cardPickup: cardPickup
        @tiles.push tile
  
  generateDeck: ->
    deck = []
    deck.push type: 'weapon', name: 'Spork', damage: 1, description: 'The Spork can rip out your opponents eyes leaving them blind', playCost: 1, useCost : 1
    deck.push type: 'weapon', name: 'Shuriken', damage: 2, description: 'Aim for the jugular of your opponent with this powerful weapon', playCost: 2, useCost : 2
    deck.push type: 'weapon', name: 'Frying Pan', damage: 3, description: 'Stolen from the kitchen of a mad chef the magical Frying Pan is bloody', playCost: 3, useCost : 2
    deck.push type: 'weapon', name: 'Ray Gun', damage: 4, description: 'Set the Ray Gun to stun to freeze and hurt your opponent', playCost: 3, useCost : 3
    deck.push type: 'weapon', name: 'Bowling Ball', damage: 4, description: 'Be sure to throw this directly at the unicorn', playCost: 4, useCost :4
    deck.push type: 'weapon', name: 'Scissors', damage: 5, description: 'Be sure to RUN with Scissors before and after cutting off your opponents ear', playCost: 5, useCost : 5
    deck.push type: 'weapon', name: 'Axe', damage: 6, description: 'Strike hard and fast with the powerful axe', playCost: 6, useCost : 6
    deck.push type: 'weapon', name: 'Rusty Fork', damage: 1, description: 'poop', playCost: 0, useCost: 1
    deck.push type: 'spell', name: 'bounce', damage: 0, description: 'poop', playCost: 2, useCost: 0
    deck.push type: 'spell', name: 'bounce', damage: 0, description: 'poop', playCost: 2, useCost: 0
    deck.push type: 'spell', name: 'bounce', damage: 0, description: 'poop', playCost: 2, useCost: 0
    deck.push type: 'spell', name: 'bounce', damage: 0, description: 'poop', playCost: 2, useCost: 0
    deck.push type: 'spell', name: 'bounce', damage: 0, description: 'poop', playCost: 2, useCost: 0
    deck.push type: 'spell', name: 'bounce', damage: 0, description: 'poop', playCost: 2, useCost: 0
    deck.push type: 'spell', name: 'bounce', damage: 0, description: 'poop', playCost: 2, useCost: 0
    
    deck.push type: 'weapon', name: 'Spork', damage: 1, description: 'The Spork can rip out your opponents eyes leaving them blind', playCost: 1, useCost : 1
    deck.push type: 'weapon', name: 'Shuriken', damage: 2, description: 'Aim for the jugular of your opponent with this powerful weapon', playCost: 2, useCost : 2
    deck.push type: 'weapon', name: 'Frying Pan', damage: 3, description: 'Stolen from the kitchen of a mad chef the magical Frying Pan is bloody', playCost: 3, useCost : 2
    deck.push type: 'weapon', name: 'Ray Gun', damage: 4, description: 'Set the Ray Gun to stun to freeze and hurt your opponent', playCost: 3, useCost : 3
    deck.push type: 'weapon', name: 'Bowling Ball', damage: 4, description: 'Be sure to throw this directly at the unicorn', playCost: 4, useCost :4
    deck.push type: 'weapon', name: 'Scissors', damage: 5, description: 'Be sure to RUN with Scissors before and after cutting off your opponents ear', playCost: 5, useCost : 5
    deck.push type: 'weapon', name: 'Axe', damage: 6, description: 'Strike hard and fast with the powerful axe', playCost: 6, useCost : 6
    deck.push type: 'weapon', name: 'Rusty Fork', damage: 1, description: 'poop', playCost: 0, useCost: 1
    deck.push type: 'spell', name: 'bounce', damage: 0, description: 'poop', playCost: 2, useCost: 0
    deck.push type: 'spell', name: 'bounce', damage: 0, description: 'poop', playCost: 2, useCost: 0
    deck.push type: 'spell', name: 'bounce', damage: 0, description: 'poop', playCost: 2, useCost: 0
    deck.push type: 'spell', name: 'bounce', damage: 0, description: 'poop', playCost: 2, useCost: 0
    deck.push type: 'spell', name: 'bounce', damage: 0, description: 'poop', playCost: 2, useCost: 0
    deck.push type: 'spell', name: 'bounce', damage: 0, description: 'poop', playCost: 2, useCost: 0
    deck.push type: 'spell', name: 'bounce', damage: 0, description: 'poop', playCost: 2, useCost: 0
    
    count = deck.length
    for [0..count*.4]
      deck.push type: 'crystal', name: 'Crystal', damage: 0, description: 'bling bling', playCost: 0, useCost: 0
    
    for obj in deck
      switch obj.type
        when 'weapon'
          card = new Weapon obj
        when 'crystal'
          card = new Crystal obj
        when 'spell'
          card = new Spell obj
        else
          card = null
      
      if card?
        @cards.splice Math.floor(Math.random()*@cards.length), null, card
  
  cardsOnBoard: ->
    for tile in @tiles
      if tile.cardPickup
        tile.update card: @cards.pop()
  
  dealCards: ->
    startingCards = 2
    for i in [0..startingCards-1]
      for player in @players
        player.addCardToHand @cards.pop()
  
  placePlayers: =>
    for player in @players
      attempts = 0
      tileId = 0
      tile = @tiles[_tileId]
      
      while attempts < 100
        _tileId = Math.floor(Math.random()*@tiles.length)
        _tile = @tiles[_tileId]
        
        if !_tile.player and !_tile.cardPickup
          tileId = _tileId
          tile = _tile
          attempts = 999999
        
        attempts++
      
        console.log "1 Add player #{player.name} to tile #{tile.positionX}x#{tile.positionY}"
      @addPlayerToTile player, tile
  
  addPlayerToTile: (player, tile) =>
    for _tile in @tiles
      if _tile.player and _tile.player.name == player.name
        _tile.player = null
    
    console.log "Add player #{player.name} to tile #{tile.positionX}x#{tile.positionY}"
    tile.update player: player
  
  changePlayer: () =>
    @meId++
    if @meId >= @players.length
      @meId = 0
    @me = @players[@meId]
    console.log "I am #{@me.name}!"
    @trigger 'game.rerender'

  endTurn: () =>
    @currentPlayerId++
    if @currentPlayerId >= @players.length
      @currentPlayerId = 0
    @meId = @currentPlayerId
    @me = @players[@meId]
    @currentPlayer = @players[@currentPlayerId]
    @currentPlayer.addCardToHand @cards.pop()
    @currentPlayer.crystals.incrementAll()
    @trigger 'game.rerender'
    
