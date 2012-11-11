template = require 'views/templates/hand'
cardTemplate = require 'views/templates/card'
Crystal = require 'models/crystal_card'
Weapon = require 'models/weapon_card'
Spell = require 'models/spell_card'

module.exports = class Crystals extends Backbone.Model
  template: template
  cardTemplate: cardTemplate
  defaults:
    player: ''
    cards: []
    cached: false
    left: 0
    right: 0
    top: 0
    width: 1
    height: 1
    isLandscape: true

  initialize: ->
    @div = $ '<div>'
    @width = 1
    @height = 1
    
    for prop, val of @attributes
      @[prop] = val
    
    @cards.push new Crystal()
    @cards.push new Crystal()
    @cards.push new Weapon()
    @cards.push new Spell()
    @cards.push new Crystal()
    @cards.push new Weapon()
    @cached = false

  update: (prop, val) ->
    if typeof prop == 'object'
      props = prop
    else
      props = {}
      props[prop] = val
    
    for prop, val of props
      if prop? and @attributes.hasOwnProperty prop
        @attributes[prop] = val
      @[prop] = val
    
    @cached = false
    @render()

  onCardClick: (e) =>
    card = $(e.currentTarget).data 'card'
    console.log "Clicked card in hand: #{card.type}"

  render: (force = false) =>
    if @cached and !force
      return @
    
    $('.playing-card', @div).unbind()
    @div.html(@template(@))
    
    @div.width(@width).height(@height).css
      left: "#{@left}px"
    
    for card in @cards
      if !card.div
        card.div = $ @cardTemplate card
      card.div.data 'card', card
      $('.cards', @div).append card.div
    
    $('.playing-card', @div).bind('click touchstart', @onCardClick)
    
    scale = if @isLandscape then @width / 200 * .8 else @height / 300 * .8
    
    count = 0
    for card in @cards
      x = if !@isLandscape then count*100 else 0
      x += @width / 2 - 100 + @pseudoRandom count*Math.PI*1000, -10, 10
      x *= scale
      y = if @isLandscape then count*100 else 0
      y +=  @pseudoRandom count*Math.PI*2000, 0, 4
      y *= scale
      r = @pseudoRandom count*Math.PI*3000, -10, 10
      cardScale = scale * 1
      card.div.css
        "transform-origin": "50% 50%"
        transform: "translate3d(#{x}px, #{y}px, 0px) rotateZ(#{r}deg) scale(#{cardScale})"
        top: 10*count
      count++
    
    @cached = true

  pseudoRandom: (seed, min, max) ->
    r = seed*Math.PI*1000000
    r = r - Math.floor(r)
    return (max-min)*r + min