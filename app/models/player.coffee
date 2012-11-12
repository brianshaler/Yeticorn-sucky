Backbone = require './backbone'
Crystal = require 'models/crystal_card'
Crystals = require 'models/crystals'

module.exports = class Player extends Backbone.Model
  
  initialize: (@name) ->
    @life = 100
    @hand = []
    @crystals = new Crystals()
    @weapons = []
    @spells = []
    
    @crystals.crystals[Math.floor(Math.random()*5)].push new Crystal()
    
  addCardToHand: (card) ->
    @hand.push card
    