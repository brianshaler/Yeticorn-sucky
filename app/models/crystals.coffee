template = require 'views/templates/crystals'

module.exports = class Crystals extends Backbone.Model
  template: template
  defaults:
    crystals: [[{_id: "asdf1"}, {_id: "asdf2"}], [], [], [], [{_id: "asdf2"}], []]

  initialize: ->
    @div = $ '<div>'
    @width = 1
    @height = 1
    
    @crystals = @attributes.crystals

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
  
  incrementAll: () ->
    for stack in [@crystals.length-2..0]
      for crystal in @crystals[stack]
        @crystals[stack+1].push crystal
      @crystals[stack] = []
    
    @render()

  render: () =>
    @crystals0 = @crystals[0].length
    @crystals1 = @crystals[1].length
    @crystals2 = @crystals[2].length
    @crystals3 = @crystals[3].length
    @crystals4 = @crystals[4].length
    @crystals5 = @crystals[5].length
    
    @div.html(@template(@))
    @div.height(@height).css
      top: "#{@top}px"
    $('.crystals-stack', @div).css
      width: Math.floor(@width/6 - 2)+"px"
      height: "#{@height}px"
