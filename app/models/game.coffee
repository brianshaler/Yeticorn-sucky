module.exports = class Game extends Backbone.Model
  defaults:
    tiles: [
      {positionX: 0, positionY: 0, player: {name: "Hi", color: "red"}},
      {positionX: 1, positionY: 0},
      {positionX: 2, positionY: 0},
      {positionX: 3, positionY: 0},
      {positionX: 0, positionY: 1},
      {positionX: 1, positionY: 1},
      {positionX: 2, positionY: 1},
      {positionX: 3, positionY: 1, hasCard: true},
      {positionX: 0, positionY: 2},
      {positionX: 1, positionY: 2},
      {positionX: 2, positionY: 2},
      {positionX: 3, positionY: 2, player: {name: "Yo", color: "blue"}, hasCard: true},
      {positionX: 0, positionY: 3},
      {positionX: 1, positionY: 3},
      {positionX: 2, positionY: 3},
      {positionX: 3, positionY: 3}
    ]
