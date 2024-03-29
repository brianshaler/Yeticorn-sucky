// Generated by CoffeeScript 1.4.0
(function() {
  var PlayerSchema, mongoose;

  mongoose = require('mongoose');

  module.exports = PlayerSchema = new mongoose.Schema({
    _game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game'
    },
    name: String
  });

  mongoose.model('Player', PlayerSchema);

}).call(this);
