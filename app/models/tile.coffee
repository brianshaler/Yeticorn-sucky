template = require 'views/templates/tile'

module.exports = class Tile extends Backbone.Model
  template: template
  defaults:
    positionX: 0
    positionY: 0
    card: false
    player: false
  
  tileWidth: 240
  tileHeight: 210

  initialize: ->
    @div = $ '<div>'

  createHitarea: (paper) ->
    @hitarea = paper.path "M0,0L0,0"
    $(@hitarea.node).on 'click touchend', (e) =>
      e.preventDefault()
      setTimeout () =>
        @trigger 'selectedTile', @
      , 1
      false

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

  render: () ->
    if @hitarea?
      x = @attributes.positionX * (@tileWidth * .75)
      y = (@attributes.positionY + (if @attributes.positionX % 2 == 0 then 0.5 else 0)) * @tileHeight

      x0 = x
      x1 = x + @tileWidth * .25
      x2 = x + @tileWidth * .75
      x3 = x + @tileWidth

      y0 = y
      y1 = y + @tileHeight * .5
      y2 = y + @tileHeight
      
      @hitarea
        .attr
          path: "M#{x1},#{y0}L#{x2},#{y0}L#{x3},#{y1}L#{x2},#{y2}L#{x1},#{y2}L#{x0},#{y1}L#{x1},#{y0}Z"
          fill: 'rgba(0,0,0,0)'
          stroke: '#fff'
          'stroke-width': 6
    
    @div.html(@template(this))
