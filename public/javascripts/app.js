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
      this.enteredName = _.once(this.enteredName);
      this.clickedPlay = _.once(this.clickedPlay);
      return $(window).on("viewportchanged", function(e) {
        var event;
        event = e.originalEvent;
        window.viewportWidth = event.width;
        return window.viewportHeight = event.height;
      });
    };

    Application.prototype.start = function() {
      this.viewport = new Viewporter('outer-container');
      return this.connectSocket();
    };

    Application.prototype.connectSocket = function() {
      var _this = this;
      this.socket = io.connect(window.location.href);
      this.socket.on('intro.show', function() {
        console.log('show');
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
      var gameId;
      gameId = null;
      if (window.location.hash.toString().length > 1) {
        gameId = window.location.hash.toString().substr(1);
      }
      return this.socket.emit('playerSetup.submit', this.playerSetupView.getName(), gameId);
    };

    Application.prototype.gameSetup = function() {
      var _this = this;
      window.location.hash = this.gameData.key;
      this.gameSetupView = new GameSetupView();
      this.gameSetupView.render();
      return this.gameSetupView.on('clickedStart', function() {
        return _this.clickedStart();
      });
    };

    Application.prototype.clickedStart = function() {
      return this.showGame();
    };

    Application.prototype.showGame = function() {
      this.model = new Game();
      this.gameView = new GameView({
        model: this.model
      });
      return this.gameView.render();
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

window.require.define({"models/crystals": function(exports, require, module) {
  var Crystals, template,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  template = require('views/templates/crystals');

  module.exports = Crystals = (function(_super) {

    __extends(Crystals, _super);

    function Crystals() {
      return Crystals.__super__.constructor.apply(this, arguments);
    }

    Crystals.prototype.template = template;

    Crystals.prototype.defaults = {
      crystals: []
    };

    Crystals.prototype.initialize = function() {
      return this.div = $('<div>');
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
      return this.render();
    };

    Crystals.prototype.render = function() {
      return this.div.html(this.template(this));
    };

    return Crystals;

  })(Backbone.Model);
  
}});

window.require.define({"models/game": function(exports, require, module) {
  var Game,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = Game = (function(_super) {

    __extends(Game, _super);

    function Game() {
      return Game.__super__.constructor.apply(this, arguments);
    }

    Game.prototype.defaults = {
      tiles: [
        {
          positionX: 0,
          positionY: 0,
          player: {
            name: "Hi",
            color: "red"
          }
        }, {
          positionX: 1,
          positionY: 0
        }, {
          positionX: 2,
          positionY: 0
        }, {
          positionX: 3,
          positionY: 0
        }, {
          positionX: 0,
          positionY: 1
        }, {
          positionX: 1,
          positionY: 1
        }, {
          positionX: 2,
          positionY: 1
        }, {
          positionX: 3,
          positionY: 1,
          hasCard: true
        }, {
          positionX: 0,
          positionY: 2
        }, {
          positionX: 1,
          positionY: 2
        }, {
          positionX: 2,
          positionY: 2
        }, {
          positionX: 3,
          positionY: 2,
          player: {
            name: "Yo",
            color: "blue"
          },
          hasCard: true
        }, {
          positionX: 0,
          positionY: 3
        }, {
          positionX: 1,
          positionY: 3
        }, {
          positionX: 2,
          positionY: 3
        }, {
          positionX: 3,
          positionY: 3
        }
      ]
    };

    return Game;

  })(Backbone.Model);
  
}});

window.require.define({"models/tile": function(exports, require, module) {
  var Tile, template,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  template = require('views/templates/tile');

  module.exports = Tile = (function(_super) {

    __extends(Tile, _super);

    function Tile() {
      return Tile.__super__.constructor.apply(this, arguments);
    }

    Tile.prototype.template = template;

    Tile.prototype.defaults = {
      positionX: 0,
      positionY: 0,
      card: false,
      player: false
    };

    Tile.prototype.tileWidth = 240;

    Tile.prototype.tileHeight = 210;

    Tile.prototype.initialize = function() {
      return this.div = $('<div>');
    };

    Tile.prototype.createHitarea = function(paper) {
      var _this = this;
      this.hitarea = paper.path("M0,0L0,0");
      return $(this.hitarea.node).on('click touchstart', function(e) {
        return _this.trigger('selectedTile', _this);
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
      return this.div.html(this.template(this));
    };

    return Tile;

  })(Backbone.Model);
  
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
      $('#page-container').html('');
      this.$el.appendTo('#page-container');
      return this.$el.html(this.template());
    };

    return GameSetupView;

  })(Backbone.View);
  
}});

window.require.define({"views/game_view": function(exports, require, module) {
  var GameView, Tile, template,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  template = require('views/templates/game');

  Tile = require('models/tile');

  module.exports = GameView = (function(_super) {

    __extends(GameView, _super);

    function GameView() {
      this.selectTile = __bind(this.selectTile, this);

      this.resetPlayers = __bind(this.resetPlayers, this);

      this.resizeWindow = __bind(this.resizeWindow, this);
      return GameView.__super__.constructor.apply(this, arguments);
    }

    GameView.prototype.template = template;

    GameView.prototype.className = 'game-page';

    GameView.prototype.initialize = function() {
      var col, row, tile, _i, _j, _k, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5,
        _this = this;
      $(window).on('viewportchanged', this.resizeWindow);
      Handlebars.registerHelper('positionLeft', function(tile) {
        return tile.attributes.positionX * (_this.tileWidth * .75);
      });
      Handlebars.registerHelper('positionTop', function(tile) {
        return (tile.attributes.positionY + (tile.attributes.positionX % 2 === 0 ? 0.5 : 0)) * _this.tileHeight;
      });
      this.configRows = Math.ceil(Math.random() * 4 + 4);
      this.configCols = Math.ceil(Math.random() * 4 + 8);
      this.rows = 0;
      this.cols = 0;
      this.tileWidth = 240;
      this.tileHeight = 210;
      this.model.attributes.tiles = [];
      for (row = _i = 0, _ref = this.configRows; 0 <= _ref ? _i <= _ref : _i >= _ref; row = 0 <= _ref ? ++_i : --_i) {
        for (col = _j = 0, _ref1 = this.configCols; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; col = 0 <= _ref1 ? ++_j : --_j) {
          tile = new Tile();
          tile.update({
            positionX: col,
            positionY: row
          });
          this.model.attributes.tiles.push(tile);
        }
      }
      this.resetPlayers();
      if (((_ref2 = this.model) != null ? (_ref3 = _ref2.attributes) != null ? (_ref4 = _ref3.tiles) != null ? _ref4.length : void 0 : void 0 : void 0) > 0) {
        _ref5 = this.model.attributes.tiles;
        for (_k = 0, _len = _ref5.length; _k < _len; _k++) {
          tile = _ref5[_k];
          this.rows = tile.attributes.positionY > this.rows ? tile.attributes.positionY : this.rows;
          this.cols = tile.attributes.positionX > this.cols ? tile.attributes.positionX : this.cols;
        }
      } else {
        console.log('Something really bad happened..');
      }
      this.rows += 1;
      return this.cols += 1;
    };

    GameView.prototype.render = function() {
      var event, tile, _i, _len, _ref, _ref1, _ref2, _ref3,
        _this = this;
      $('#page-container').html('');
      this.$el.appendTo('#page-container');
      this.$el.html(this.template(this.model));
      this.hitareas = new Raphael('map-overlay');
      if (((_ref = this.model) != null ? (_ref1 = _ref.attributes) != null ? (_ref2 = _ref1.tiles) != null ? _ref2.length : void 0 : void 0 : void 0) > 0) {
        _ref3 = this.model.attributes.tiles;
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          tile = _ref3[_i];
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
      event = document.createEvent('Event');
      event.initEvent('viewportchanged', true, true);
      event.width = window.viewportWidth;
      event.height = window.viewportHeight;
      return window.dispatchEvent(event);
    };

    GameView.prototype.resizeWindow = function(e) {
      var event, isPlayer;
      event = e.originalEvent;
      isPlayer = true;
      this.viewportWidth = event.width - 1;
      this.viewportHeight = event.height - 1;
      this.mapWidth = isPlayer ? Math.round(this.viewportWidth * .9) : this.viewportWidth;
      this.mapHeight = isPlayer ? Math.round(this.viewportHeight * .9) : this.viewportHeight;
      this.handWidth = this.viewportWidth - this.mapWidth;
      this.crystalsHeight = this.viewportHeight - this.mapHeight;
      this.renderMap();
      if (isPlayer) {
        this.renderCrystals();
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
      var top;
      top = this.viewportHeight - this.crystalsHeight;
      return $('.crystals-holder').height(this.crystalsHeight).css({
        top: "" + top + "px"
      });
    };

    GameView.prototype.renderHand = function() {
      var left;
      left = this.viewportWidth - this.handWidth;
      return $('.hand-holder').width(this.handWidth).height(this.viewportHeight).css({
        left: "" + left + "px"
      });
    };

    GameView.prototype.resetPlayers = function() {
      var card, col, player, players, row, tile, _i, _len, _ref, _results;
      players = ['blue', 'gray', 'orange', 'yellow'];
      _ref = this.model.attributes.tiles;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tile = _ref[_i];
        row = tile.attributes.positionY;
        col = tile.attributes.positionX;
        if (Math.floor(Math.random() * 30) === 0) {
          player = {
            name: "dude",
            color: players[Math.floor(Math.random() * players.length)]
          };
        } else {
          player = false;
        }
        card = ((row + 2) % 5) + ((col + 2) % 5) === 0;
        _results.push(tile.update({
          player: player,
          card: card
        }));
      }
      return _results;
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

window.require.define({"views/templates/game": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"map-holder\">\n  <div class=\"game-board game-map\">\n  </div>\n  <div class=\"game-board map-overlay\" id=\"map-overlay\" style=\"width: 1000px; height: 1000px;\">\n  </div>\n</div>\n<div class=\"crystals-holder\">\n  \n</div>\n<div class=\"hand-holder\">\n  \n</div>";});
}});

window.require.define({"views/templates/game_setup": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<header>\n  <h1>Get Ready!</h1>\n</header>\n\n<form>\n  <div>\n    <a href=\"#\" class=\"start\">Start!</a>\n  </div>\n</form>";});
}});

window.require.define({"views/templates/intro": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<header>\n  <h1>Welcome to Yeticorn!</h1>\n</header>\n\n<form>\n  <div>\n    <a href=\"#\" class=\"play\">Play!</a>\n  </div>\n</form>";});
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

