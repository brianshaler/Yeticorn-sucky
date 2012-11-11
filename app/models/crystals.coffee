template = require 'views/templates/crystals'
cardTemplate = require 'views/templates/card'
Crystal = require 'models/crystal_card'

cardWidth = 142
cardHeight = 223

module.exports = class Crystals extends Backbone.Model
  template: template
  cardTemplate: cardTemplate
  
  cardWidth: cardWidth
  cardHeight: cardHeight
  
  defaults:
    player: ''
    crystals: [[], [], [], [], [], []]
    lastRender: [-1, 0, 0, 0, 0, 0]
    left: 0
    right: 0
    top: 0
    width: 1
    height: 1

  initialize: ->
    @div = $ '<div>'
    @width = 1
    @height = 1
    
    for prop, val of @attributes
      @[prop] = val
    
    @crystals[0].push new Crystal()
    @crystals[0].push new Crystal()
    @crystals[0].push new Crystal()
    @crystals[2].push new Crystal()
    @crystals[2].push new Crystal()
    @crystals[2].push new Crystal()
    @crystals[3].push new Crystal()
    @crystals[3].push new Crystal()
    @crystals[3].push new Crystal()
    @crystals[3].push new Crystal()
    @crystals[3].push new Crystal()
    @crystals[4].push new Crystal()
    @crystals[4].push new Crystal()
    @crystals[4].push new Crystal()
    @crystals[5].push new Crystal()
    
    for i in [0..@crystals.length-1]
      for crystal in @crystals[i]
        crystal.energy = i
    

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
    
    @render()

  incrementAll: ->
    for stack in [@crystals.length-2..0]
      for crystal in @crystals[stack]
        @crystals[stack+1].push crystal
      @crystals[stack] = []
    
    @render()

  onStackClick: (e) =>
    energy = parseInt($(e.currentTarget).attr 'data-energy')
    if energy > 0 and @crystals[energy].length > 0
      crystal = @crystals[energy][@crystals[energy].length-1]
      @spendCrystal crystal

  spendCrystal: (crystal) ->
    console.log "Spending a crystal! #{crystal.energy}"

  render: (force = false) =>
    unchanged = true
    thisRender = []
    
    for i in [0..@crystals.length-1]
      @["crystals#{i}"] = @crystals[i].length
      if @crystals[i].length != @lastRender[i]
        unchanged = false
      thisRender[i] = @crystals[i].length
    
    if unchanged and !force and 1==2
      return @
    
    # if there are already events, cleanup
    $('.crystals-stack', @div).unbind()
    
    unscaledWidth = 700
    @stackWidth = Math.floor @width/6
    scale = @width / (unscaledWidth*6)
    
    @div.html(@template(@))
    @div.height(@height).css
      top: "#{@top}px"
    stacks = $('.crystals-stack', @div).css(
      width: "#{@stackWidth}px"
      height: "#{@height}px"
    ).bind('click touchstart', @onStackClick)
    
    for i in [0..@crystals.length-1]
      slot = $ ".crystals-stack-#{i}", @div
      slot.css
        left: i*@stackWidth + "px"
      stack = $ ".cards", slot
      count = 0
      for crystal in @crystals[i]
        x = @stackWidth / 2 / scale - @cardWidth*.5 + @pseudoRandom (i*Math.PI*1000)*count, -10, 10
        x *= scale
        y = @cardHeight*.5 * @height/@stackWidth + count*20 + @pseudoRandom (i*Math.PI*2000)*count, 0, 4
        y *= scale
        r = @pseudoRandom (i*Math.PI*3000)*count, -10, 10
        card = $('<div>').append $ @cardTemplate crystal
        cardScale = scale * 1.4
        card.css
          "transform-origin": "50% 50%"
          transform: "translate3d(#{x}px, #{y}px, 0px) rotateZ(#{r}deg) scale(#{cardScale})"
          top: 10*count
        
        stack.append card
        count++
    #$('.unscaled', @div).css
    #  transform: 'scale(' + 1/scale + ')'
    @lastRender = thisRender
    this

  pseudoRandom: (seed, min, max) ->
    r = seed*Math.PI*1000000
    r = r - Math.floor(r)
    return (max-min)*r + min