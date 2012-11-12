(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle) {
    for (var key in bundle) {
      if (has(bundle, key)) {
        modules[key] = bundle[key];
      }
    }
  }

  globals.require = require;
  globals.require.define = define;
  globals.require.brunch = true;
})();

window.require.define({"application": function(exports, require, module) {
  var Application, Game, GameSetupView, GameView, IntroView, PlayerSetupView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Game = require('models/game');

  IntroView = require('views/intro_view');

  PlayerSetupView = require('views/player_setup_view');

  GameSetupView = require('views/game_setup_view');

  GameView = require('views/game_view');

  module.exports = Application = (function(_super) {

    __extends(Application, _super);

    function Application() {
      return Application.__super__.constructor.apply(this, arguments);
    }

    Application.prototype.initialize = function() {
      var _this = this;
      this.enteredName = _.once(this.enteredName);
      this.clickedPlay = _.once(this.clickedPlay);
      this.clickedStart = _.once(this.clickedStart);
      $(window).on("viewportchanged", function(e) {
        var event;
        event = e.originalEvent;
        window.viewportWidth = event.width;
        return window.viewportHeight = event.height;
      });
      this.tileWidth = 240;
      this.tileHeight = 210;
      Handlebars.registerHelper('positionLeft', function(tile) {
        return tile.attributes.positionX * (_this.tileWidth * .75);
      });
      return Handlebars.registerHelper('positionTop', function(tile) {
        return (tile.attributes.positionY + (tile.attributes.positionX % 2 === 0 ? 0.5 : 0)) * _this.tileHeight;
      });
    };

    Application.prototype.start = function() {
      this.playerId = '';
      this.viewport = new Viewporter('outer-container');
      return this.connectSocket();
    };

    Application.prototype.connectSocket = function() {
      var _this = this;
      this.socket = io.connect(window.location.href);
      this.showGame();
      return;
      this.socket.on('intro.show', function() {
        return _this.intro();
      });
      return this.socket.on('gameSetup.show', function(gameData) {
        _this.gameData = gameData;
        return _this.gameSetup();
      });
    };

    Application.prototype.intro = function() {
      var _this = this;
      this.introView = new IntroView;
      this.introView.render();
      return this.introView.on('clickedPlay', function() {
        return _this.clickedPlay();
      });
    };

    Application.prototype.clickedPlay = function() {
      return this.playerSetup();
    };

    Application.prototype.playerSetup = function() {
      var _this = this;
      this.playerSetupView = new PlayerSetupView();
      this.playerSetupView.render();
      return this.playerSetupView.on('entered name', function() {
        return _this.enteredName();
      });
    };

    Application.prototype.enteredName = function() {
      var gameId,
        _this = this;
      gameId = null;
      if (window.location.hash.toString().length > 1) {
        gameId = window.location.hash.toString().substr(1);
      }
      this.socket.on('playerSetup.complete', function(data) {
        console.log('playerSetup.complete');
        if ((data != null ? data.playerId : void 0) != null) {
          _this.playerId = data.playerId;
          return console.log(data);
        }
      });
      return this.socket.emit('playerSetup.submit', this.playerSetupView.getName(), gameId);
    };

    Application.prototype.gameSetup = function() {
      var _this = this;
      window.location.hash = this.gameData.gameId;
      this.gameSetupView = new GameSetupView();
      this.gameSetupView.players = this.gameData.players;
      this.gameSetupView.render();
      return this.gameSetupView.on('clickedStart', function() {
        return _this.clickedStart();
      });
    };

    Application.prototype.clickedStart = function() {
      var _this = this;
      this.socket.emit('gameSetup.submit', {
        gameId: this.gameData.gameId
      });
      return this.socket.on('gameSetup.complete', function(game) {
        return _this.showGame(game);
      });
    };

    Application.prototype.showGame = function(gameData) {
      this.model = new Game(gameData, {
        socket: this.socket
      });
      this.gameView = new GameView({
        model: this.model
      });
      this.model.on('game.started', this.gameView.init);
      this.model.on('game.rerender', this.gameView.init);
      return this.model.init();
    };

    return Application;

  })(Backbone.Model);
  
}});

window.require.define({"initialize": function(exports, require, module) {
  var Application;

  Application = require('application');

  $(document).on('ready', function() {
    var app;
    app = new Application();
    return app.start();
  });
  
}});

window.require.define({"models/backbone": function(exports, require, module) {
  
  if (typeof window !== "undefined" && window !== null) {
    module.exports = window.Backbone;
  } else {
    module.exports = require('backbone');
  }
  
}});

window.require.define({"models/card": function(exports, require, module) {
  var Card, template,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  template = require('views/templates/card');

  module.exports = Card = (function(_super) {

    __extends(Card, _super);

    function Card() {
      return Card.__super__.constructor.apply(this, arguments);
    }

    Card.prototype.template = template;

    Card.prototype.defaults = {
      type: ''
    };

    Card.prototype.render = function() {
      if (!(this.div != null)) {
        this.div = $('<div>');
      }
      return this.div.html(this.template(this));
    };

    return Card;

  })(Backbone.Model);
  
}});

window.require.define({"models/crystal_card": function(exports, require, module) {
  var Card, Crystal,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Card = require('models/card');

  module.exports = Crystal = (function(_super) {

    __extends(Crystal, _super);

    function Crystal() {
      return Crystal.__super__.constructor.apply(this, arguments);
    }

    Crystal.prototype.initialize = function() {
      this.type = 'crystal';
      return this.energy = 0;
    };

    return Crystal;

  })(Card);
  
}});

window.require.define({"models/crystals": function(exports, require, module) {
  var Crystal, Crystals, cardHeight, cardTemplate, cardWidth, template,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  template = require('views/templates/crystals');

  cardTemplate = require('views/templates/card');

  Crystal = require('models/crystal_card');

  cardWidth = 142;

  cardHeight = 223;

  module.exports = Crystals = (function(_super) {

    __extends(Crystals, _super);

    function Crystals() {
      this.render = __bind(this.render, this);

      this.onStackClick = __bind(this.onStackClick, this);
      return Crystals.__super__.constructor.apply(this, arguments);
    }

    Crystals.prototype.template = template;

    Crystals.prototype.cardTemplate = cardTemplate;

    Crystals.prototype.cardWidth = cardWidth;

    Crystals.prototype.cardHeight = cardHeight;

    Crystals.prototype.defaults = {
      player: ''
    };

    Crystals.prototype.initialize = function() {
      var crystal, i, _i, _ref, _results;
      this.div = $('<div>');
      this.width = 1;
      this.height = 1;
      this.player = '';
      this.crystals = [[], [], [], [], [], []];
      this.lastRender = [-1, 0, 0, 0, 0, 0];
      this.left = 0;
      this.right = 0;
      this.top = 0;
      this.width = 1;
      this.height = 1;
      _results = [];
      for (i = _i = 0, _ref = this.crystals.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push((function() {
          var _j, _len, _ref1, _results1;
          _ref1 = this.crystals[i];
          _results1 = [];
          for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
            crystal = _ref1[_j];
            _results1.push(crystal.energy = i);
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Crystals.prototype.update = function(prop, val) {
      var props;
      if (typeof prop === 'object') {
        props = prop;
      } else {
        props = {};
        props[prop] = val;
      }
      for (prop in props) {
        val = props[prop];
        this[prop] = val;
      }
      return this.render();
    };

    Crystals.prototype.incrementAll = function() {
      var crystal, stack, _i, _j, _len, _ref, _ref1;
      for (stack = _i = _ref = this.crystals.length - 2; _ref <= 0 ? _i <= 0 : _i >= 0; stack = _ref <= 0 ? ++_i : --_i) {
        _ref1 = this.crystals[stack];
        for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
          crystal = _ref1[_j];
          this.crystals[stack + 1].push(crystal);
        }
        this.crystals[stack] = [];
      }
      return this.render();
    };

    Crystals.prototype.onStackClick = function(e) {
      var crystal, energy;
      energy = parseInt($(e.currentTarget).attr('data-energy'));
      if (energy > 0 && this.crystals[energy].length > 0) {
        crystal = this.crystals[energy][this.crystals[energy].length - 1];
        return this.spendCrystal(crystal);
      }
    };

    Crystals.prototype.spendCrystal = function(crystal) {
      return console.log("Spending a crystal! " + crystal.energy);
    };

    Crystals.prototype.render = function(force) {
      var card, cardScale, count, crystal, i, r, scale, slot, stack, stacks, thisRender, unchanged, unscaledWidth, x, y, _i, _j, _k, _len, _ref, _ref1, _ref2;
      if (force == null) {
        force = false;
      }
      unchanged = true;
      thisRender = [];
      for (i = _i = 0, _ref = this.crystals.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        this["crystals" + i] = this.crystals[i].length;
        if (this.crystals[i].length !== this.lastRender[i]) {
          unchanged = false;
        }
        thisRender[i] = this.crystals[i].length;
      }
      if (unchanged && !force && 1 === 2) {
        return this;
      }
      $('.crystals-stack', this.div).unbind();
      unscaledWidth = 700;
      this.stackWidth = Math.floor(this.width / 6);
      scale = this.width / (unscaledWidth * 6);
      this.div.html(this.template(this));
      this.div.height(this.height).css({
        top: "" + this.top + "px"
      });
      stacks = $('.crystals-stack', this.div).css({
        width: "" + this.stackWidth + "px",
        height: "" + this.height + "px"
      }).bind('click touchstart', this.onStackClick);
      for (i = _j = 0, _ref1 = this.crystals.length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        slot = $(".crystals-stack-" + i, this.div);
        slot.css({
          left: i * this.stackWidth + "px"
        });
        stack = $(".cards", slot);
        count = 0;
        _ref2 = this.crystals[i];
        for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
          crystal = _ref2[_k];
          x = this.stackWidth / 2 / scale - this.cardWidth * .5 + this.pseudoRandom((i * Math.PI * 1000) * count, -10, 10);
          x *= scale;
          y = this.cardHeight * .5 * this.height / this.stackWidth + count * 20 + this.pseudoRandom((i * Math.PI * 2000) * count, 0, 4);
          y *= scale;
          r = this.pseudoRandom((i * Math.PI * 3000) * count, -10, 10);
          card = $('<div>').append($(this.cardTemplate(crystal)));
          cardScale = scale * 1.4;
          card.css({
            "transform-origin": "50% 50%",
            transform: "translate3d(" + x + "px, " + y + "px, 0px) rotateZ(" + r + "deg) scale(" + cardScale + ")",
            top: 10 * count
          });
          stack.append(card);
          count++;
        }
      }
      this.lastRender = thisRender;
      return this;
    };

    Crystals.prototype.pseudoRandom = function(seed, min, max) {
      var r;
      r = seed * Math.PI * 1000000;
      r = r - Math.floor(r);
      return (max - min) * r + min;
    };

    return Crystals;

  })(Backbone.Model);
  
}});

window.require.define({"models/game": function(exports, require, module) {
  var Backbone, Crystal, Crystals, Game, Player, Spell, Tile, Weapon,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Backbone = require('./backbone');

  Tile = require('./tile');

  Player = require('./player');

  Crystals = require('models/crystals');

  Weapon = require('models/weapon_card');

  Crystal = require('models/crystal_card');

  Spell = require('models/spell_card');

  module.exports = Game = (function(_super) {

    __extends(Game, _super);

    function Game() {
      this.endTurn = __bind(this.endTurn, this);

      this.changePlayer = __bind(this.changePlayer, this);

      this.addPlayerToTile = __bind(this.addPlayerToTile, this);

      this.placePlayers = __bind(this.placePlayers, this);

      this.init = __bind(this.init, this);
      return Game.__super__.constructor.apply(this, arguments);
    }

    Game.prototype.defaults = {
      gameId: ''
    };

    Game.prototype.initialize = function(socket) {
      var colors, i, player, playerNames, _i, _ref;
      this.socket = socket;
      playerNames = ['@brianshaler', '@batkin', '@bobrox', '@johnmurch'];
      colors = ['blue', 'yellow', 'orange', 'gray'];
      this.players = [];
      for (i = _i = 0, _ref = playerNames.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        player = new Player(playerNames[i]);
        player.color = colors[i];
        this.players.push(player);
      }
      console.log(this.players);
      this.meId = this.currentPlayerId = Math.floor(Math.random() * this.players.length);
      this.currentPlayer = this.players[this.currentPlayerId];
      this.me = this.currentPlayer;
      this.tiles = [];
      this.cards = [];
      this.deck = [];
      this.generateMap();
      this.generateDeck();
      this.cardsOnBoard();
      this.dealCards();
      return this.placePlayers();
    };

    Game.prototype.initialize2 = function(attributes, options) {
      var obj, tile, _i, _len, _ref, _results;
      this.socket = options.socket;
      _ref = attributes.tiles;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        tile = new Tile();
        tile.positionX = obj.positionX;
        tile.positionY = obj.positionY;
        if (obj.card) {
          tile.card = obj.card;
        }
        if (obj.player) {
          _results.push(tile.player = obj.player);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Game.prototype.init = function() {
      return this.trigger('game.started');
    };

    Game.prototype.generateMap = function() {
      var cardPickup, col, mapCols, mapRows, row, tile, _i, _results;
      mapRows = 6;
      mapCols = 10;
      _results = [];
      for (row = _i = 0; 0 <= mapRows ? _i <= mapRows : _i >= mapRows; row = 0 <= mapRows ? ++_i : --_i) {
        _results.push((function() {
          var _j, _results1;
          _results1 = [];
          for (col = _j = 0; 0 <= mapCols ? _j <= mapCols : _j >= mapCols; col = 0 <= mapCols ? ++_j : --_j) {
            tile = new Tile();
            cardPickup = ((row + 1) % 2) + ((col + 1) % 3) === 0 ? true : false;
            tile.update({
              positionX: col,
              positionY: row,
              cardPickup: cardPickup
            });
            _results1.push(this.tiles.push(tile));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Game.prototype.generateDeck = function() {
      var card, count, deck, obj, _i, _j, _len, _ref, _results;
      deck = [];
      deck.push({
        type: 'weapon',
        name: 'Spork',
        damage: 1,
        description: 'The Spork can rip out your opponents eyes leaving them blind',
        playCost: 1,
        useCost: 1
      });
      deck.push({
        type: 'weapon',
        name: 'Shuriken',
        damage: 2,
        description: 'Aim for the jugular of your opponent with this powerful weapon',
        playCost: 2,
        useCost: 2
      });
      deck.push({
        type: 'weapon',
        name: 'Frying Pan',
        damage: 3,
        description: 'Stolen from the kitchen of a mad chef the magical Frying Pan is bloody',
        playCost: 3,
        useCost: 2
      });
      deck.push({
        type: 'weapon',
        name: 'Ray Gun',
        damage: 4,
        description: 'Set the Ray Gun to stun to freeze and hurt your opponent',
        playCost: 3,
        useCost: 3
      });
      deck.push({
        type: 'weapon',
        name: 'Bowling Ball',
        damage: 4,
        description: 'Be sure to throw this directly at the unicorn',
        playCost: 4,
        useCost: 4
      });
      deck.push({
        type: 'weapon',
        name: 'Scissors',
        damage: 5,
        description: 'Be sure to RUN with Scissors before and after cutting off your opponents ear',
        playCost: 5,
        useCost: 5
      });
      deck.push({
        type: 'weapon',
        name: 'Axe',
        damage: 6,
        description: 'Strike hard and fast with the powerful axe',
        playCost: 6,
        useCost: 6
      });
      deck.push({
        type: 'weapon',
        name: 'Rusty Fork',
        damage: 1,
        description: 'poop',
        playCost: 0,
        useCost: 1
      });
      deck.push({
        type: 'spell',
        name: 'bounce',
        damage: 0,
        description: 'poop',
        playCost: 2,
        useCost: 0
      });
      deck.push({
        type: 'spell',
        name: 'bounce',
        damage: 0,
        description: 'poop',
        playCost: 2,
        useCost: 0
      });
      deck.push({
        type: 'spell',
        name: 'bounce',
        damage: 0,
        description: 'poop',
        playCost: 2,
        useCost: 0
      });
      deck.push({
        type: 'spell',
        name: 'bounce',
        damage: 0,
        description: 'poop',
        playCost: 2,
        useCost: 0
      });
      deck.push({
        type: 'spell',
        name: 'bounce',
        damage: 0,
        description: 'poop',
        playCost: 2,
        useCost: 0
      });
      deck.push({
        type: 'spell',
        name: 'bounce',
        damage: 0,
        description: 'poop',
        playCost: 2,
        useCost: 0
      });
      deck.push({
        type: 'spell',
        name: 'bounce',
        damage: 0,
        description: 'poop',
        playCost: 2,
        useCost: 0
      });
      deck.push({
        type: 'weapon',
        name: 'Spork',
        damage: 1,
        description: 'The Spork can rip out your opponents eyes leaving them blind',
        playCost: 1,
        useCost: 1
      });
      deck.push({
        type: 'weapon',
        name: 'Shuriken',
        damage: 2,
        description: 'Aim for the jugular of your opponent with this powerful weapon',
        playCost: 2,
        useCost: 2
      });
      deck.push({
        type: 'weapon',
        name: 'Frying Pan',
        damage: 3,
        description: 'Stolen from the kitchen of a mad chef the magical Frying Pan is bloody',
        playCost: 3,
        useCost: 2
      });
      deck.push({
        type: 'weapon',
        name: 'Ray Gun',
        damage: 4,
        description: 'Set the Ray Gun to stun to freeze and hurt your opponent',
        playCost: 3,
        useCost: 3
      });
      deck.push({
        type: 'weapon',
        name: 'Bowling Ball',
        damage: 4,
        description: 'Be sure to throw this directly at the unicorn',
        playCost: 4,
        useCost: 4
      });
      deck.push({
        type: 'weapon',
        name: 'Scissors',
        damage: 5,
        description: 'Be sure to RUN with Scissors before and after cutting off your opponents ear',
        playCost: 5,
        useCost: 5
      });
      deck.push({
        type: 'weapon',
        name: 'Axe',
        damage: 6,
        description: 'Strike hard and fast with the powerful axe',
        playCost: 6,
        useCost: 6
      });
      deck.push({
        type: 'weapon',
        name: 'Rusty Fork',
        damage: 1,
        description: 'poop',
        playCost: 0,
        useCost: 1
      });
      deck.push({
        type: 'spell',
        name: 'bounce',
        damage: 0,
        description: 'poop',
        playCost: 2,
        useCost: 0
      });
      deck.push({
        type: 'spell',
        name: 'bounce',
        damage: 0,
        description: 'poop',
        playCost: 2,
        useCost: 0
      });
      deck.push({
        type: 'spell',
        name: 'bounce',
        damage: 0,
        description: 'poop',
        playCost: 2,
        useCost: 0
      });
      deck.push({
        type: 'spell',
        name: 'bounce',
        damage: 0,
        description: 'poop',
        playCost: 2,
        useCost: 0
      });
      deck.push({
        type: 'spell',
        name: 'bounce',
        damage: 0,
        description: 'poop',
        playCost: 2,
        useCost: 0
      });
      deck.push({
        type: 'spell',
        name: 'bounce',
        damage: 0,
        description: 'poop',
        playCost: 2,
        useCost: 0
      });
      deck.push({
        type: 'spell',
        name: 'bounce',
        damage: 0,
        description: 'poop',
        playCost: 2,
        useCost: 0
      });
      count = deck.length;
      for (_i = 0, _ref = count * .4; 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i++ : _i--) {
        deck.push({
          type: 'crystal',
          name: 'Crystal',
          damage: 0,
          description: 'bling bling',
          playCost: 0,
          useCost: 0
        });
      }
      _results = [];
      for (_j = 0, _len = deck.length; _j < _len; _j++) {
        obj = deck[_j];
        switch (obj.type) {
          case 'weapon':
            card = new Weapon(obj);
            break;
          case 'crystal':
            card = new Crystal(obj);
            break;
          case 'spell':
            card = new Spell(obj);
            break;
          default:
            card = null;
        }
        if (card != null) {
          _results.push(this.cards.splice(Math.floor(Math.random() * this.cards.length), null, card));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Game.prototype.cardsOnBoard = function() {
      var tile, _i, _len, _ref, _results;
      _ref = this.tiles;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tile = _ref[_i];
        if (tile.cardPickup) {
          _results.push(tile.update({
            card: this.cards.pop()
          }));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Game.prototype.dealCards = function() {
      var i, player, startingCards, _i, _ref, _results;
      startingCards = 2;
      _results = [];
      for (i = _i = 0, _ref = startingCards - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push((function() {
          var _j, _len, _ref1, _results1;
          _ref1 = this.players;
          _results1 = [];
          for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
            player = _ref1[_j];
            _results1.push(player.addCardToHand(this.cards.pop()));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Game.prototype.placePlayers = function() {
      var attempts, player, tile, tileId, _i, _len, _ref, _results, _tile, _tileId;
      _ref = this.players;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        player = _ref[_i];
        attempts = 0;
        tileId = 0;
        tile = this.tiles[_tileId];
        while (attempts < 100) {
          _tileId = Math.floor(Math.random() * this.tiles.length);
          _tile = this.tiles[_tileId];
          if (!_tile.player && !_tile.cardPickup) {
            tileId = _tileId;
            tile = _tile;
            attempts = 999999;
          }
          attempts++;
          console.log("1 Add player " + player.name + " to tile " + tile.positionX + "x" + tile.positionY);
        }
        _results.push(this.addPlayerToTile(player, tile));
      }
      return _results;
    };

    Game.prototype.addPlayerToTile = function(player, tile) {
      var _i, _len, _ref, _tile;
      _ref = this.tiles;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _tile = _ref[_i];
        if (_tile.player && _tile.player.name === player.name) {
          _tile.player = null;
        }
      }
      console.log("Add player " + player.name + " to tile " + tile.positionX + "x" + tile.positionY);
      return tile.update({
        player: player
      });
    };

    Game.prototype.changePlayer = function() {
      this.meId++;
      if (this.meId >= this.players.length) {
        this.meId = 0;
      }
      this.me = this.players[this.meId];
      console.log("I am " + this.me.name + "!");
      return this.trigger('game.rerender');
    };

    Game.prototype.endTurn = function() {
      this.currentPlayerId++;
      if (this.currentPlayerId >= this.players.length) {
        this.currentPlayerId = 0;
      }
      this.meId = this.currentPlayerId;
      this.me = this.players[this.meId];
      this.currentPlayer = this.players[this.currentPlayerId];
      this.currentPlayer.addCardToHand(this.cards.pop());
      this.currentPlayer.crystals.incrementAll();
      return this.trigger('game.rerender');
    };

    return Game;

  })(Backbone.Model);
  
}});

window.require.define({"models/hand": function(exports, require, module) {
  var Crystal, Crystals, Spell, Weapon, cardHeight, cardTemplate, cardWidth, template,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  template = require('views/templates/hand');

  cardTemplate = require('views/templates/card');

  Crystal = require('models/crystal_card');

  Weapon = require('models/weapon_card');

  Spell = require('models/spell_card');

  cardWidth = 142;

  cardHeight = 223;

  module.exports = Crystals = (function(_super) {

    __extends(Crystals, _super);

    function Crystals() {
      this.render = __bind(this.render, this);

      this.onCardClick = __bind(this.onCardClick, this);
      return Crystals.__super__.constructor.apply(this, arguments);
    }

    Crystals.prototype.template = template;

    Crystals.prototype.cardTemplate = cardTemplate;

    Crystals.prototype.cardWidth = cardWidth;

    Crystals.prototype.cardHeight = cardHeight;

    Crystals.prototype.defaults = {
      player: '',
      cards: [],
      cached: false,
      left: 0,
      right: 0,
      top: 0,
      width: 1,
      height: 1,
      isLandscape: true
    };

    Crystals.prototype.initialize = function() {
      var prop, val, _ref;
      this.div = $('<div>');
      this.width = 1;
      this.height = 1;
      _ref = this.attributes;
      for (prop in _ref) {
        val = _ref[prop];
        this[prop] = val;
      }
      this.cards.push(new Crystal());
      this.cards.push(new Crystal());
      this.cards.push(new Weapon());
      this.cards.push(new Spell());
      this.cards.push(new Crystal());
      this.cards.push(new Weapon());
      return this.cached = false;
    };

    Crystals.prototype.update = function(prop, val) {
      var props;
      if (typeof prop === 'object') {
        props = prop;
      } else {
        props = {};
        props[prop] = val;
      }
      for (prop in props) {
        val = props[prop];
        if ((prop != null) && this.attributes.hasOwnProperty(prop)) {
          this.attributes[prop] = val;
        }
        this[prop] = val;
      }
      this.cached = false;
      return this.render();
    };

    Crystals.prototype.onCardClick = function(e) {
      var card;
      card = $(e.currentTarget).data('card');
      return console.log("Clicked card in hand: " + card.type);
    };

    Crystals.prototype.render = function(force) {
      var card, cardScale, count, r, scale, x, y, _i, _j, _len, _len1, _ref, _ref1;
      if (force == null) {
        force = false;
      }
      if (this.cached && !force) {
        return this;
      }
      $('.playing-card', this.div).unbind();
      this.div.html(this.template(this));
      this.div.width(this.width).height(this.height).css({
        left: "" + this.left + "px"
      });
      _ref = this.cards;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        card = _ref[_i];
        if (!card.div) {
          card.div = $(this.cardTemplate(card));
        }
        card.div.data('card', card);
        $('.cards', this.div).append(card.div);
      }
      $('.playing-card', this.div).bind('click touchstart', this.onCardClick);
      scale = this.isLandscape ? this.width / this.cardWidth * .7 : this.height / this.cardHeight * .8;
      count = 0;
      _ref1 = this.cards;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        card = _ref1[_j];
        x = !this.isLandscape ? this.width / 2 / scale + (count - this.cards.length * .5) * this.cardWidth * .7 : this.width / 2 / scale;
        x += this.pseudoRandom(count * Math.PI * 1000, 0, 10);
        y = this.isLandscape ? this.height / 2 / scale + (1 + count - this.cards.length * .5) * this.cardWidth * .5 : this.height / 2 / scale;
        y += this.pseudoRandom(count * Math.PI * 2000, 0, 10);
        r = this.pseudoRandom(count * Math.PI * 3000, -10, 10);
        cardScale = scale * 1;
        card.div.css({
          "transform-origin": "50% 50%",
          transform: "translate3d(-" + (this.cardWidth / 2) + "px, -" + (this.cardHeight / 2) + ("px, 0px) scale(" + cardScale + ") translate3d(" + x + "px, " + y + "px, 0px) rotateZ(" + r + "deg)")
        });
        count++;
      }
      return this.cached = true;
    };

    Crystals.prototype.pseudoRandom = function(seed, min, max) {
      var r;
      r = seed * Math.PI * 1000000;
      r = r - Math.floor(r);
      return (max - min) * r + min;
    };

    return Crystals;

  })(Backbone.Model);
  
}});

window.require.define({"models/player": function(exports, require, module) {
  var Backbone, Crystal, Crystals, Player,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Backbone = require('./backbone');

  Crystal = require('models/crystal_card');

  Crystals = require('models/crystals');

  module.exports = Player = (function(_super) {

    __extends(Player, _super);

    function Player() {
      return Player.__super__.constructor.apply(this, arguments);
    }

    Player.prototype.initialize = function(name) {
      this.name = name;
      this.life = 100;
      this.hand = [];
      this.crystals = new Crystals();
      this.weapons = [];
      this.spells = [];
      return this.crystals.crystals[Math.floor(Math.random() * 5)].push(new Crystal());
    };

    Player.prototype.addCardToHand = function(card) {
      return this.hand.push(card);
    };

    return Player;

  })(Backbone.Model);
  
}});

window.require.define({"models/spell_card": function(exports, require, module) {
  var Card, Spell,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Card = require('models/card');

  module.exports = Spell = (function(_super) {

    __extends(Spell, _super);

    function Spell() {
      return Spell.__super__.constructor.apply(this, arguments);
    }

    Spell.prototype.initialize = function() {
      return this.type = 'spell';
    };

    return Spell;

  })(Card);
  
}});

window.require.define({"models/tile": function(exports, require, module) {
  var Backbone, Tile,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Backbone = require('./backbone');

  module.exports = Tile = (function(_super) {

    __extends(Tile, _super);

    function Tile() {
      return Tile.__super__.constructor.apply(this, arguments);
    }

    Tile.prototype.defaults = {
      positionX: 0,
      positionY: 0,
      card: false,
      player: false,
      cardPickup: false
    };

    Tile.prototype.tileWidth = 240;

    Tile.prototype.tileHeight = 210;

    Tile.prototype.initialize = function(props) {
      this.div = $('<div>');
      return this.update(props);
    };

    Tile.prototype.createHitarea = function(paper) {
      var _this = this;
      this.hitarea = paper.path("M0,0L0,0");
      return $(this.hitarea.node).on('click touchend', function(e) {
        e.preventDefault();
        setTimeout(function() {
          return _this.trigger('selectedTile', _this);
        }, 1);
        return false;
      });
    };

    Tile.prototype.update = function(prop, val) {
      var props;
      if (typeof prop === 'object') {
        props = prop;
      } else {
        props = {};
        props[prop] = val;
      }
      for (prop in props) {
        val = props[prop];
        if ((prop != null) && this.attributes.hasOwnProperty(prop)) {
          this.attributes[prop] = val;
        }
        this[prop] = val;
      }
      return this.render();
    };

    Tile.prototype.render = function() {
      var x, x0, x1, x2, x3, y, y0, y1, y2;
      this.template || (this.template = require('views/templates/tile'));
      if (this.hitarea != null) {
        x = this.attributes.positionX * (this.tileWidth * .75);
        y = (this.attributes.positionY + (this.attributes.positionX % 2 === 0 ? 0.5 : 0)) * this.tileHeight;
        x0 = x;
        x1 = x + this.tileWidth * .25;
        x2 = x + this.tileWidth * .75;
        x3 = x + this.tileWidth;
        y0 = y;
        y1 = y + this.tileHeight * .5;
        y2 = y + this.tileHeight;
        this.hitarea.attr({
          path: "M" + x1 + "," + y0 + "L" + x2 + "," + y0 + "L" + x3 + "," + y1 + "L" + x2 + "," + y2 + "L" + x1 + "," + y2 + "L" + x0 + "," + y1 + "L" + x1 + "," + y0 + "Z",
          fill: 'rgba(0,0,0,0)',
          stroke: '#fff',
          'stroke-width': 6
        });
      }
      if (this.positionX >= 0 && this.positionY >= 0) {
        return this.div.html(this.template(this));
      }
    };

    return Tile;

  })(Backbone.Model);
  
}});

window.require.define({"models/underscore": function(exports, require, module) {
  
  if (typeof window !== "undefined" && window !== null) {
    module.exports = window._;
  } else {
    module.exports = require('underscore');
  }
  
}});

window.require.define({"models/weapon_card": function(exports, require, module) {
  var Card, Weapon,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Card = require('models/card');

  module.exports = Weapon = (function(_super) {

    __extends(Weapon, _super);

    function Weapon() {
      return Weapon.__super__.constructor.apply(this, arguments);
    }

    Weapon.prototype.initialize = function() {
      return this.type = 'weapon';
    };

    return Weapon;

  })(Card);
  
}});

window.require.define({"views/game_setup_view": function(exports, require, module) {
  var GameSetupView, template,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  template = require('views/templates/game_setup');

  module.exports = GameSetupView = (function(_super) {

    __extends(GameSetupView, _super);

    function GameSetupView() {
      return GameSetupView.__super__.constructor.apply(this, arguments);
    }

    GameSetupView.prototype.template = template;

    GameSetupView.prototype.className = 'game-setup setup';

    GameSetupView.prototype.events = {
      'click .start': 'onClickedStart'
    };

    GameSetupView.prototype.onClickedStart = function(e) {
      this.trigger('clickedStart');
      e.preventDefault();
      return false;
    };

    GameSetupView.prototype.render = function() {
      var html;
      $('#page-container').html('');
      this.$el.appendTo('#page-container');
      html = this.template({
        players: this.players
      });
      return this.$el.html(html);
    };

    return GameSetupView;

  })(Backbone.View);
  
}});

window.require.define({"views/game_view": function(exports, require, module) {
  var GameView, Hand, Tile, template,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  template = require('views/templates/game');

  Tile = require('models/tile');

  Hand = require('models/hand');

  module.exports = GameView = (function(_super) {

    __extends(GameView, _super);

    function GameView() {
      this.endTurn = __bind(this.endTurn, this);

      this.changePlayer = __bind(this.changePlayer, this);

      this.selectTile = __bind(this.selectTile, this);

      this.resizeWindow = __bind(this.resizeWindow, this);

      this.init = __bind(this.init, this);
      return GameView.__super__.constructor.apply(this, arguments);
    }

    GameView.prototype.template = template;

    GameView.prototype.className = 'game-page';

    GameView.prototype.initialize = function() {
      $(window).on('viewportchanged', this.resizeWindow);
      this.tileWidth = 240;
      return this.tileHeight = 210;
    };

    GameView.prototype.init = function() {
      var tile, _i, _len, _ref;
      this.rows = 0;
      this.cols = 0;
      if (this.model.tiles.length > 0) {
        _ref = this.model.tiles;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          tile = _ref[_i];
          this.rows = tile.positionY > this.rows ? tile.positionY : this.rows;
          this.cols = tile.positionX > this.cols ? tile.positionX : this.cols;
        }
      }
      this.rows += 1;
      this.cols += 1;
      window.me = this.model.me;
      return this.render();
    };

    GameView.prototype.render = function() {
      var event, tile, _i, _len, _ref,
        _this = this;
      $('#page-container').html('');
      this.$el.appendTo('#page-container');
      this.$el.html(this.template(this.model));
      $('.current-user-name').html(this.model.me.name);
      $('.change-player').click(this.changePlayer);
      $('.end-turn').click(this.endTurn);
      this.hitareas = new Raphael('map-overlay');
      if (this.model.tiles.length > 0) {
        _ref = this.model.tiles;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          tile = _ref[_i];
          tile.createHitarea(this.hitareas);
          tile.on('selectedTile', function(selectedTile) {
            return _this.selectTile(selectedTile);
          });
          tile.render();
          $('.game-map').append(tile.div);
        }
      } else {
        console.log('Something really bad happened..');
      }
      $('.crystals-holder').html('');
      this.crystals = this.model.me.crystals;
      this.crystals.update({
        div: $('.crystals-holder')
      });
      this.hand = new Hand();
      this.hand.update({
        cards: this.model.me.hand,
        div: $('.hand-holder')
      });
      event = document.createEvent('Event');
      event.initEvent('viewportchanged', true, true);
      event.width = window.viewportWidth;
      event.height = window.viewportHeight;
      event.isLandscape = window.innerWidth > window.innerHeight;
      return window.dispatchEvent(event);
    };

    GameView.prototype.resizeWindow = function(e) {
      var event, horizontalSize, isPlayer, verticalSize;
      event = e.originalEvent;
      isPlayer = true;
      if (this.viewportWidth === event.width && this.viewportHeight === event.height) {
        return this;
      }
      this.viewportWidth = event.width;
      this.viewportHeight = event.height - 1;
      this.isLandscape = event.isLandscape;
      horizontalSize = .79;
      verticalSize = .81;
      if (!this.isLandscape) {
        verticalSize *= verticalSize;
      }
      this.mapWidth = isPlayer && this.isLandscape ? Math.round(this.viewportWidth * horizontalSize) : this.viewportWidth;
      this.mapHeight = isPlayer ? Math.round(this.viewportHeight * verticalSize) : this.viewportHeight;
      this.handWidth = this.isLandscape ? this.viewportWidth - this.mapWidth : this.viewportWidth;
      this.handHeight = this.isLandscape ? this.viewportHeight : (this.viewportHeight - this.mapHeight) / 2;
      this.crystalsWidth = this.viewportWidth - (this.isLandscape ? this.handWidth : 0);
      this.crystalsHeight = (this.viewportHeight - this.mapHeight) * (this.isLandscape ? 1 : .5);
      if (!isPlayer) {
        this.handWidth = this.handHeight = this.crystalsWidth = this.crystalsHeight = 0;
      }
      this.renderMap();
      if (isPlayer) {
        this.renderCrystals(true);
        return this.renderHand();
      } else {
        $('.crystals-holder').hide();
        return $('.hand-holder').hide();
      }
    };

    GameView.prototype.renderMap = function() {
      var fullMapHeight, fullMapWidth, offsetX, offsetY, scale, scaleX, scaleY, transform;
      fullMapWidth = Math.ceil((this.cols + .5) * this.tileWidth * .75);
      fullMapHeight = Math.ceil((this.rows + .5) * this.tileHeight);
      scaleX = this.mapWidth / fullMapWidth;
      scaleY = this.mapHeight / fullMapHeight;
      scale = scaleX < scaleY ? scaleX : scaleY;
      offsetX = Math.ceil((this.mapWidth - fullMapWidth * scale) / 2);
      offsetY = Math.ceil((this.mapHeight - fullMapHeight * scale) / 2);
      if (!this.isLandscape) {
        offsetY += this.handHeight;
      }
      transform = "scale(" + scale + ")";
      $('.game-board').css({
        '-webkit-transform': transform,
        '-moz-transform': transform,
        '-ms-transform': transform,
        '-o-transform': transform,
        transform: transform,
        left: "" + offsetX + "px",
        top: "" + offsetY + "px"
      });
      $('.map-holder').width(this.mapWidth).height(this.mapHeight);
      $('#map-overlay').width(fullMapWidth).height(fullMapHeight);
      return $('svg', $('#map-overlay')).width(fullMapWidth).height(fullMapHeight).attr({
        width: fullMapWidth + "px",
        height: fullMapHeight + "px"
      });
    };

    GameView.prototype.renderCrystals = function() {
      if (!this.crystals) {
        return;
      }
      this.crystals.update({
        width: this.crystalsWidth,
        height: this.crystalsHeight,
        top: this.viewportHeight - this.crystalsHeight
      });
      return this.crystals.render();
    };

    GameView.prototype.renderHand = function() {
      this.hand.update({
        width: this.handWidth,
        height: this.handHeight,
        left: this.viewportWidth - this.handWidth,
        isLandscape: this.isLandscape
      });
      return this.hand.render();
    };

    GameView.prototype.selectTile = function(tile) {
      var str;
      str = "";
      if (tile.attributes.player) {
        str += tile.attributes.player.color + "\n";
      }
      if (tile.attributes.card) {
        str += "There's a card here!";
      }
      if (str.length > 0) {
        return console.log(str);
      }
    };

    GameView.prototype.changePlayer = function() {
      return this.model.changePlayer();
    };

    GameView.prototype.endTurn = function() {
      return this.model.endTurn();
    };

    return GameView;

  })(Backbone.View);
  
}});

window.require.define({"views/intro_view": function(exports, require, module) {
  var IntroView, template,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  template = require('views/templates/intro');

  module.exports = IntroView = (function(_super) {

    __extends(IntroView, _super);

    function IntroView() {
      return IntroView.__super__.constructor.apply(this, arguments);
    }

    IntroView.prototype.template = template;

    IntroView.prototype.className = 'intro setup';

    IntroView.prototype.events = {
      'click .play': 'onClickedPlay'
    };

    IntroView.prototype.onClickedPlay = function(e) {
      this.trigger('clickedPlay');
      e.preventDefault();
      return false;
    };

    IntroView.prototype.render = function() {
      $('#page-container').html('');
      this.$el.appendTo('#page-container');
      return this.$el.html(this.template());
    };

    return IntroView;

  })(Backbone.View);
  
}});

window.require.define({"views/player_setup_view": function(exports, require, module) {
  var PlayerSetupView, template,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  template = require('views/templates/player_setup');

  module.exports = PlayerSetupView = (function(_super) {

    __extends(PlayerSetupView, _super);

    function PlayerSetupView() {
      return PlayerSetupView.__super__.constructor.apply(this, arguments);
    }

    PlayerSetupView.prototype.template = template;

    PlayerSetupView.prototype.className = 'player-setup setup';

    PlayerSetupView.prototype.events = {
      'submit form': 'submitForm'
    };

    PlayerSetupView.prototype.submitForm = function(e) {
      this.trigger('entered name');
      return false;
    };

    PlayerSetupView.prototype.getName = function() {
      return this.$el.find('input[type=text]').val();
    };

    PlayerSetupView.prototype.render = function() {
      $('#page-container').html('');
      this.$el.appendTo('#page-container');
      return this.$el.html(this.template());
    };

    return PlayerSetupView;

  })(Backbone.View);
  
}});

window.require.define({"views/templates/card": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<div class=\"playing-card playing-card-";
    foundHelper = helpers.type;
    stack1 = foundHelper || depth0.type;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "type", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n  &nbsp;\n</div>";
    return buffer;});
}});

window.require.define({"views/templates/crystals": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<div class=\"crystals-stack crystals-stack-0\" data-energy=\"0\">\n  <div class=\"cards\"></div>\n  <div class=\"label unscaled\">0pt</div>\n  <div class=\"card-count unscaled\">";
    foundHelper = helpers.crystals0;
    stack1 = foundHelper || depth0.crystals0;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "crystals0", { hash: {} }); }
    buffer += escapeExpression(stack1) + "x</div>\n</div>\n<div class=\"crystals-stack crystals-stack-1\" data-energy=\"1\">\n  <div class=\"cards\"></div>\n  <div class=\"label unscaled\">1pt</div>\n  <div class=\"card-count unscaled\">";
    foundHelper = helpers.crystals1;
    stack1 = foundHelper || depth0.crystals1;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "crystals1", { hash: {} }); }
    buffer += escapeExpression(stack1) + "x</div>\n</div>\n<div class=\"crystals-stack crystals-stack-2\" data-energy=\"2\">\n  <div class=\"cards\"></div>\n  <div class=\"label unscaled\">2pt</div>\n  <div class=\"card-count unscaled\">";
    foundHelper = helpers.crystals2;
    stack1 = foundHelper || depth0.crystals2;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "crystals2", { hash: {} }); }
    buffer += escapeExpression(stack1) + "x</div>\n</div>\n<div class=\"crystals-stack crystals-stack-3\" data-energy=\"3\">\n  <div class=\"cards\"></div>\n  <div class=\"label unscaled\">3pt</div>\n  <div class=\"card-count unscaled\">";
    foundHelper = helpers.crystals3;
    stack1 = foundHelper || depth0.crystals3;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "crystals3", { hash: {} }); }
    buffer += escapeExpression(stack1) + "x</div>\n</div>\n<div class=\"crystals-stack crystals-stack-4\" data-energy=\"4\">\n  <div class=\"cards\"></div>\n  <div class=\"label unscaled\">4pt</div>\n  <div class=\"card-count unscaled\">";
    foundHelper = helpers.crystals4;
    stack1 = foundHelper || depth0.crystals4;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "crystals4", { hash: {} }); }
    buffer += escapeExpression(stack1) + "x</div>\n</div>\n<div class=\"crystals-stack crystals-stack-5\" data-energy=\"5\">\n  <div class=\"cards\"></div>\n  <div class=\"label unscaled\">5pt</div>\n  <div class=\"card-count unscaled\">";
    foundHelper = helpers.crystals5;
    stack1 = foundHelper || depth0.crystals5;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "crystals5", { hash: {} }); }
    buffer += escapeExpression(stack1) + "x</div>\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/game": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"map-holder\">\n  <div class=\"game-board game-map\">\n  </div>\n  <div class=\"game-board map-overlay\" id=\"map-overlay\" style=\"width: 1000px; height: 1000px;\">\n  </div>\n</div>\n<div class=\"crystals-holder\">\n  \n</div>\n<div class=\"hand-holder\">\n  \n</div>\n<div style=\"position: absolute; top: 0px; left: 0px;\">\n  <div>You are: <span class=\"current-user-name\"></span></div>\n  <div><input type=\"button\" value=\"End Turn\" class=\"end-turn\" /></div>\n  <div><input type=\"button\" value=\"Change Player\" class=\"change-player\" /></div>\n</div>";});
}});

window.require.define({"views/templates/game_setup": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n      <li>";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</li>\n    ";
    return buffer;}

    buffer += "<header>\n  <h1>Get Ready!</h1>\n</header>\n\n<form>\n  <ul>\n    ";
    foundHelper = helpers.players;
    stack1 = foundHelper || depth0.players;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  </ul>\n  <div>\n    <a href=\"#\" class=\"start\">Start!</a>\n  </div>\n</form>";
    return buffer;});
}});

window.require.define({"views/templates/hand": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"hand\">\n  <div class=\"cards\"></div>\n</div>";});
}});

window.require.define({"views/templates/intro": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<header>\n  <h1>Welcome to Yeticorn!</h1>\n</header>\n\n<form>\n  <div>\n    <a href=\"#\" class=\"play\">Play!</a>\n  </div>\n	<p>\n		Yeticorn is a mobile-friendly board game involving mythical yetis with unicorn horns who move, cast spells, and attack using energy from magic crystals. \n	</p>\n	<p>\n		The goal is to kill your opponents by reducing their life points to zero. \n	</p>\n	<p>\n		The game is played on a map where players move their yeticorn character on the board to collect cards and attack opponents.\n	</p> \n	<p>\n		Good Luck!\n	</p>\n	\n</form>";});
}});

window.require.define({"views/templates/player_setup": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<header>\n  <h1>Yeticorn</h1>\n</header>\n\n<form method=\"post\" action=\"/\">\n\n  <div class=\"select-player\">\n    <a href=\"#\">Carl</a>\n    <a href=\"#\">???</a>\n  </div>\n\n  <div>\n    <input type=\"text\" placeholder=\"Player Name\" />\n  </div>\n\n  <p>\n    Meet Carl.\n  </p>\n\n  <p>\n    Carl has a bad habit of leaving \"The Gaga Pit of Doom\"\n    and seeking out lost wanderers for dinner.\n  </p>\n\n  <div>\n    <input type=\"submit\" value=\"Next &raquo;\" />\n  </div>\n\n</form>";});
}});

window.require.define({"views/templates/tile": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    
    return " tile-with-card";}

  function program3(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n  <!-- <span>";
    foundHelper = helpers.player;
    stack1 = foundHelper || depth0.player;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.name);
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "player.name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span> -->\n  <img src=\"/images/player_";
    foundHelper = helpers.attributes;
    stack1 = foundHelper || depth0.attributes;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.player);
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.color);
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.player.color", { hash: {} }); }
    buffer += escapeExpression(stack1) + ".png\" />\n  ";
    return buffer;}

    buffer += "<div class=\"game-tile";
    foundHelper = helpers.attributes;
    stack1 = foundHelper || depth0.attributes;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.card);
    stack2 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\" style=\"left: ";
    stack1 = depth0;
    foundHelper = helpers.positionLeft;
    stack2 = foundHelper || depth0.positionLeft;
    if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
    else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "positionLeft", stack1, { hash: {} }); }
    else { stack1 = stack2; }
    buffer += escapeExpression(stack1) + "px; top: ";
    stack1 = depth0;
    foundHelper = helpers.positionTop;
    stack2 = foundHelper || depth0.positionTop;
    if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
    else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "positionTop", stack1, { hash: {} }); }
    else { stack1 = stack2; }
    buffer += escapeExpression(stack1) + "px;\">\n  ";
    foundHelper = helpers.attributes;
    stack1 = foundHelper || depth0.attributes;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.player);
    stack2 = helpers['if'];
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</div>\n";
    return buffer;});
}});

