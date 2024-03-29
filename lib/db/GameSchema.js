// Generated by CoffeeScript 1.4.0
(function() {
  var GameSchema, mongoose;

  mongoose = require('mongoose');

  module.exports = GameSchema = new mongoose.Schema({
    gameId: String,
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
      }
    ],
    currentPlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    cards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cards'
      }
    ],
    tiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tiles'
      }
    ]
  });

  GameSchema.methods.initGame = function(cb) {
    var Card, Tile,
      _this = this;
    Card = mongoose.model('Card');
    Tile = mongoose.model('Tile');
    return Card.generateDeck(this.gameId, function(err, cards) {
      var card, _i, _len;
      if (err) {
        return cb(err);
      }
      _this.cards = [];
      for (_i = 0, _len = cards.length; _i < _len; _i++) {
        card = cards[_i];
        _this.cards.push(card.id);
      }
      return Tile.generateBoard(_this.gameId, function(err, tiles) {
        var tile, _j, _len1;
        if (err) {
          return cb(err);
        }
        _this.tiles = [];
        for (_j = 0, _len1 = tiles.length; _j < _len1; _j++) {
          tile = tiles[_j];
          _this.tiles.push(tile.id);
        }
        return cb(null);
      });
    });
  };

  GameSchema.methods.startGame = function(cb) {
    var Player;
    Player = mongoose.model('Player');
    this.currentPlayer = this.players[Math.floor(Math.random() * this.players.length)];
    return this.save(function(err) {
      return cb;
    });
  };

  mongoose.model('Game', GameSchema);

}).call(this);
