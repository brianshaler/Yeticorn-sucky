template = require 'views/templates/game'
Tile = require 'models/tile'

module.exports = class GameView extends Backbone.View
  template: template
  className: 'game-page'

  initialize: ->
    $(window).on 'viewportchanged', @resizeWindow
    
    Handlebars.registerHelper 'positionLeft', (tile) =>
      tile.attributes.positionX * (@tileWidth * .75)
    Handlebars.registerHelper 'positionTop', (tile) =>
      (tile.attributes.positionY + (if tile.attributes.positionX % 2 == 0 then 0.5 else 0)) * @tileHeight
    
    @configRows = Math.ceil Math.random()*4 + 4
    @configCols = Math.ceil Math.random()*4 + 8
    
    @rows = 0
    @cols = 0
    @tileWidth = 240
    @tileHeight = 210
    
    @model.attributes.tiles = []
    for row in [0..@configRows]
      for col in [0..@configCols]
        tile = new Tile()
        tile.update positionX: col, positionY: row
        @model.attributes.tiles.push tile
    
    @resetPlayers()
    
    if @model?.attributes?.tiles?.length > 0
      for tile in @model.attributes.tiles
        @rows = if tile.attributes.positionY > @rows then tile.attributes.positionY else @rows
        @cols = if tile.attributes.positionX > @cols then tile.attributes.positionX else @cols
    else
      console.log 'Something really bad happened..'
    
    @rows += 1
    @cols += 1

  render: ->
    $('#page-container').html ''
    @$el.appendTo('#page-container')
    @$el.html(@template(@model))
    
    @hitareas = new Raphael 'map-overlay'
    
    if @model?.attributes?.tiles?.length > 0
      for tile in @model.attributes.tiles
        tile.createHitarea @hitareas
        tile.on 'selectedTile', (selectedTile) =>
          @selectTile selectedTile
          #@resetPlayers()
        
        tile.render()
        $('.game-map').append tile.div
    else
      console.log 'Something really bad happened..'
    
    event = document.createEvent 'Event'
    event.initEvent 'viewportchanged', true, true
    event.width = window.viewportWidth
    event.height = window.viewportHeight
    window.dispatchEvent event

  resizeWindow: (e) =>
    event = e.originalEvent
    isPlayer = true
    
    @viewportWidth = event.width - 1
    @viewportHeight = event.height - 1
    
    @mapWidth = if isPlayer then Math.round(@viewportWidth * .9) else @viewportWidth
    @mapHeight = if isPlayer then Math.round(@viewportHeight * .9) else @viewportHeight
    
    @handWidth = @viewportWidth - @mapWidth
    @crystalsHeight = @viewportHeight - @mapHeight
    
    @renderMap()
    
    if isPlayer
      @renderCrystals()
      @renderHand()
      #@renderWeapons()
    else
      $('.crystals-holder').hide()
      $('.hand-holder').hide()

  renderMap: () ->
    fullMapWidth = Math.ceil (@cols+.5) * @tileWidth*.75
    fullMapHeight = Math.ceil (@rows+.5) * @tileHeight
    
    scaleX = @mapWidth / fullMapWidth
    scaleY = @mapHeight / fullMapHeight
    scale = if scaleX < scaleY then scaleX else scaleY
    offsetX = Math.ceil (@mapWidth - fullMapWidth*scale) / 2
    offsetY = Math.ceil (@mapHeight - fullMapHeight*scale) / 2
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
    
    $('.map-holder').width(@mapWidth).height(@mapHeight)
    $('#map-overlay').width(fullMapWidth).height(fullMapHeight)
    $('svg', $('#map-overlay')).width(fullMapWidth).height(fullMapHeight).attr width: fullMapWidth+"px", height: fullMapHeight+"px"

  renderCrystals: () ->
    top = @viewportHeight - @crystalsHeight
    $('.crystals-holder').height(@crystalsHeight).css(top: "#{top}px")

  renderHand: () ->
    left = @viewportWidth - @handWidth
    $('.hand-holder').width(@handWidth).height(@viewportHeight).css(left: "#{left}px")

  resetPlayers: () =>
    players = ['blue', 'gray', 'orange', 'yellow']
    for tile in @model.attributes.tiles
      row = tile.attributes.positionY
      col = tile.attributes.positionX
      if Math.floor(Math.random()*30) == 0
        player = 
          name: "dude"
          color: players[Math.floor(Math.random()*players.length)]
      else
        player = false
      card = ((row+2) % 5) + ((col+2) % 5) == 0
      
      tile.update player: player, card: card

  selectTile: (tile) =>
    str = ""
    if tile.attributes.player
      str += tile.attributes.player.color + "\n"
    
    if tile.attributes.card
      str += "There's a card here!"
    
    if str.length > 0
      console.log str