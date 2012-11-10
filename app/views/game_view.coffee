template = require 'views/templates/game'

module.exports = class GameView extends Backbone.View
  template: template
  className: 'game-page'

  initialize: ->
    $(window).on 'viewportchanged', @resizeWindow
    
    @rows = 0
    @cols = 0
    @tileWidth = 240
    @tileHeight = 210
    
    @model.attributes.tiles = []
    
    rand1 = Math.ceil Math.random()*8 + 4
    rand2 = Math.ceil Math.random()*10 + 8
    for row in [0..rand1]
      for col in [0..rand2]
        @model.attributes.tiles.push positionX: col, positionY: row, hasCard: ((row % 5) + (col % 5) == 0), player: (Math.floor(Math.random()*30) == 0)
    
    if @model?.attributes?.tiles?.length > 0
      for tile in @model.attributes.tiles
        @rows = if tile.positionY > @rows then tile.positionY else @rows
        @cols = if tile.positionX > @cols then tile.positionX else @cols
    else
      console.log 'Something really bad happened..'
    
    @rows += 1
    @cols += 1
    
    Handlebars.registerHelper 'positionLeft', (tile) =>
      tile.positionX * (@tileWidth * .75)
    Handlebars.registerHelper 'positionTop', (tile) =>
      (tile.positionY + (if tile.positionX % 2 == 0 then 0.5 else 0)) * @tileHeight

  render: ->
    $('#page-container').html ''
    @$el.appendTo('#page-container')
    @$el.html(@template(@model))
    
    @hitareas = new Raphael 'map-overlay'
    
    if @model?.attributes?.tiles?.length > 0
      for tile in @model.attributes.tiles
        x = tile.positionX * (@tileWidth * .75)
        x0 = x
        x1 = x + @tileWidth * .25
        x2 = x + @tileWidth * .75
        x3 = x + @tileWidth
        y = (tile.positionY + (if tile.positionX % 2 == 0 then 0.5 else 0)) * @tileHeight
        y0 = y
        y1 = y + @tileHeight * .5
        y2 = y + @tileHeight
        @hitareas.path("M#{x1},#{y0}L#{x2},#{y0}L#{x3},#{y1}L#{x2},#{y2}L#{x1},#{y2}L#{x0},#{y1}L#{x1},#{y0}")
          .attr
            fill: 'rgba(0,0,0,0)'
            stroke: '#fff'
            'stroke-width': 6
    else
      console.log 'Something really bad happened..'
    
    event = document.createEvent 'Event'
    event.initEvent 'viewportchanged', true, true
    event.width = window.viewportWidth
    event.height = window.viewportHeight
    window.dispatchEvent event

  resizeWindow: (e) =>
    event = e.originalEvent
    mapWidth = Math.ceil (@cols+.5) * @tileWidth*.75
    mapHeight = Math.ceil (@rows+.5) * @tileHeight
    scaleX = event.width / mapWidth
    scaleY = event.height / mapHeight
    scale = if scaleX < scaleY then scaleX else scaleY
    offsetX = Math.ceil (event.width - mapWidth*scale) / 2
    offsetY = Math.ceil (event.height - mapHeight*scale) / 2
    transform = "scale(" + scale + ")"
    $('.game-board').css(
      '-webkit-transform': transform
      '-moz-transform': transform
      '-ms-transform': transform
      '-o-transform': transform
      transform: transform,
      left: "#{offsetX}px",
      top: "#{offsetY}px"
    )
    $('#map-overlay').width(mapWidth).height(mapHeight)
    $('svg', $('#map-overlay')).width(mapWidth).height(mapHeight).attr width: mapWidth+"px", height: mapHeight+"px"

  resetPlayers: () ->
    
