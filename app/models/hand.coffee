template = require 'views/templates/hand'
cardTemplate = require 'views/templates/card'
Crystal = require 'models/crystal_card'
Weapon = require 'models/weapon_card'
Spell = require 'models/spell_card'

cardWidth = 142
cardHeight = 223

module.exports = class Crystals extends Backbone.Model
  template: template
  cardTemplate: cardTemplate
  
  cardWidth: cardWidth
  cardHeight: cardHeight
  
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
    
    scale = if @isLandscape then @width / @cardWidth * .7 else @height / @cardHeight * .8
    
    count = 0
    for card in @cards
      x = if !@isLandscape then @width / 2 / scale + (count - @cards.length*.5)*@cardWidth*.7 else @width / 2 / scale
      x += @pseudoRandom count*Math.PI*1000, 0, 10
      #x *= scale
      y = if @isLandscape then @height / 2 / scale + (1 + count - @cards.length*.5)*@cardWidth*.5 else @height / 2 / scale
      y += @pseudoRandom count*Math.PI*2000, 0, 10
      #y *= scale
      r = @pseudoRandom count*Math.PI*3000, -10, 10
      cardScale = scale * 1
      card.div.css
        "transform-origin": "50% 50%"
        transform: "translate3d(-"+@cardWidth/2+"px, -"+@cardHeight/2+", 0px) scale(#{cardScale}) translate3d(#{x}px, #{y}px, 0px) rotateZ(#{r}deg)"
      count++
    
    @cached = true

  pseudoRandom: (seed, min, max) ->
    r = seed*Math.PI*1000000
    r = r - Math.floor(r)
    return (max-min)*r + min