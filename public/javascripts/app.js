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
  var Application, Game, GameView, HomePageView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  HomePageView = require('views/home_page_view');

  Game = require('models/game');

  GameView = require('views/game_view');

  module.exports = Application = (function(_super) {

    __extends(Application, _super);

    function Application() {
      return Application.__super__.constructor.apply(this, arguments);
    }

    Application.prototype.initialize = function() {
      return this.enteredName = _.once(this.enteredName);
    };

    Application.prototype.start = function() {
      this.viewport = new Viewporter('outer-container');
      this.showGame();
      return this.connectSocket();
    };

    Application.prototype.goHome = function() {
      var _this = this;
      this.homePageView = new HomePageView();
      this.homePageView.render();
      return this.homePageView.on('entered name', function() {
        return _this.enteredName();
      });
    };

    Application.prototype.showGame = function() {
      this.model = new Game();
      this.gameView = new GameView({
        model: this.model
      });
      return this.gameView.render();
    };

    Application.prototype.connectSocket = function() {
      this.socket = io.connect(window.location.href);
      this.socket.on('begin', function() {
        return console.log('begin called');
      });
      return this.socket.on('game code', function(id) {
        return window.location.hash = id;
      });
    };

    Application.prototype.enteredName = function() {
      return this.socket.emit('new game', this.homePageView.getName());
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
            name: "Hi"
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
            name: "Yo"
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

window.require.define({"views/game_view": function(exports, require, module) {
  var GameView, template,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  template = require('views/templates/game');

  module.exports = GameView = (function(_super) {

    __extends(GameView, _super);

    function GameView() {
      this.resizeWindow = __bind(this.resizeWindow, this);
      return GameView.__super__.constructor.apply(this, arguments);
    }

    GameView.prototype.template = template;

    GameView.prototype.className = 'game-page';

    GameView.prototype.initialize = function() {
      var col, rand1, rand2, row, tile, _i, _j, _k, _len, _ref, _ref1, _ref2, _ref3,
        _this = this;
      $(window).on('viewportchanged', this.resizeWindow);
      this.rows = 0;
      this.cols = 0;
      this.tileWidth = 240;
      this.tileHeight = 210;
      this.model.attributes.tiles = [];
      rand1 = Math.ceil(Math.random() * 8 + 4);
      rand2 = Math.ceil(Math.random() * 10 + 8);
      for (row = _i = 0; 0 <= rand1 ? _i <= rand1 : _i >= rand1; row = 0 <= rand1 ? ++_i : --_i) {
        for (col = _j = 0; 0 <= rand2 ? _j <= rand2 : _j >= rand2; col = 0 <= rand2 ? ++_j : --_j) {
          this.model.attributes.tiles.push({
            positionX: col,
            positionY: row,
            hasCard: (row % 5) + (col % 5) === 0,
            player: Math.floor(Math.random() * 30) === 0
          });
        }
      }
      if (((_ref = this.model) != null ? (_ref1 = _ref.attributes) != null ? (_ref2 = _ref1.tiles) != null ? _ref2.length : void 0 : void 0 : void 0) > 0) {
        _ref3 = this.model.attributes.tiles;
        for (_k = 0, _len = _ref3.length; _k < _len; _k++) {
          tile = _ref3[_k];
          this.rows = tile.positionY > this.rows ? tile.positionY : this.rows;
          this.cols = tile.positionX > this.cols ? tile.positionX : this.cols;
        }
      } else {
        console.log('Something really bad happened..');
      }
      this.rows += 1;
      this.cols += 1;
      Handlebars.registerHelper('positionLeft', function(tile) {
        return tile.positionX * (_this.tileWidth * .75);
      });
      return Handlebars.registerHelper('positionTop', function(tile) {
        return (tile.positionY + (tile.positionX % 2 === 0 ? 0.5 : 0)) * _this.tileHeight;
      });
    };

    GameView.prototype.render = function() {
      var tile, x, x0, x1, x2, x3, y, y0, y1, y2, _i, _len, _ref, _ref1, _ref2, _ref3, _results;
      this.$el.appendTo('#page-container');
      this.$el.html(this.template(this.model));
      this.hitareas = new Raphael('map-overlay');
      if (((_ref = this.model) != null ? (_ref1 = _ref.attributes) != null ? (_ref2 = _ref1.tiles) != null ? _ref2.length : void 0 : void 0 : void 0) > 0) {
        _ref3 = this.model.attributes.tiles;
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          tile = _ref3[_i];
          x = tile.positionX * (this.tileWidth * .75);
          x0 = x;
          x1 = x + this.tileWidth * .25;
          x2 = x + this.tileWidth * .75;
          x3 = x + this.tileWidth;
          y = (tile.positionY + (tile.positionX % 2 === 0 ? 0.5 : 0)) * this.tileHeight;
          y0 = y;
          y1 = y + this.tileHeight * .5;
          y2 = y + this.tileHeight;
          _results.push(this.hitareas.path("M" + x1 + "," + y0 + "L" + x2 + "," + y0 + "L" + x3 + "," + y1 + "L" + x2 + "," + y2 + "L" + x1 + "," + y2 + "L" + x0 + "," + y1 + "L" + x1 + "," + y0).attr({
            fill: 'rgba(0,0,0,0)',
            stroke: '#fff',
            'stroke-width': 6
          }));
        }
        return _results;
      } else {
        return console.log('Something really bad happened..');
      }
    };

    GameView.prototype.resizeWindow = function(e) {
      var event, mapHeight, mapWidth, offsetX, offsetY, scale, scaleX, scaleY, transform;
      event = e.originalEvent;
      console.log('resizeWindow(' + event.width + ', ' + event.height + ')');
      mapWidth = Math.ceil((this.cols + .5) * this.tileWidth * .75);
      mapHeight = Math.ceil((this.rows + .5) * this.tileHeight);
      scaleX = event.width / mapWidth;
      scaleY = event.height / mapHeight;
      scale = scaleX < scaleY ? scaleX : scaleY;
      offsetX = Math.ceil((event.width - mapWidth * scale) / 2);
      offsetY = Math.ceil((event.height - mapHeight * scale) / 2);
      console.log('board: ' + this.cols + 'x' + this.rows);
      transform = "scale(" + scale + ")";
      console.log(transform);
      $('.game-board').css({
        '-webkit-transform': transform,
        '-moz-transform': transform,
        '-ms-transform': transform,
        '-o-transform': transform,
        transform: transform,
        left: "" + offsetX + "px",
        top: "" + offsetY + "px"
      });
      $('#map-overlay').width(mapWidth).height(mapHeight);
      return $('svg', $('#map-overlay')).width(mapWidth).height(mapHeight).attr({
        width: mapWidth + "px",
        height: mapHeight + "px"
      });
    };

    GameView.prototype.resetPlayers = function() {};

    return GameView;

  })(Backbone.View);
  
}});

window.require.define({"views/home_page_view": function(exports, require, module) {
  var HomePageView, template,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  template = require('views/templates/home');

  module.exports = HomePageView = (function(_super) {

    __extends(HomePageView, _super);

    function HomePageView() {
      return HomePageView.__super__.constructor.apply(this, arguments);
    }

    HomePageView.prototype.template = template;

    HomePageView.prototype.className = 'home-page';

    HomePageView.prototype.events = {
      'submit form': 'submitForm'
    };

    HomePageView.prototype.submitForm = function(e) {
      this.trigger('entered name');
      return false;
    };

    HomePageView.prototype.getName = function() {
      return this.$el.find('input[type=text]').val();
    };

    HomePageView.prototype.render = function() {
      this.$el.appendTo('#page-container');
      return this.$el.html(this.template());
    };

    return HomePageView;

  })(Backbone.View);
  
}});

window.require.define({"views/templates/game": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n    <div class=\"game-tile";
    foundHelper = helpers.hasCard;
    stack1 = foundHelper || depth0.hasCard;
    stack2 = helpers['if'];
    tmp1 = self.program(2, program2, data);
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
    buffer += escapeExpression(stack1) + "px;\">\n      ";
    foundHelper = helpers.player;
    stack1 = foundHelper || depth0.player;
    stack2 = helpers['if'];
    tmp1 = self.program(4, program4, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n    </div>\n  ";
    return buffer;}
  function program2(depth0,data) {
    
    
    return " tile-with-card";}

  function program4(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n      <!-- <span>";
    foundHelper = helpers.player;
    stack1 = foundHelper || depth0.player;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.name);
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "player.name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span> -->\n      <img src=\"/images/player_on_tile.png\" />\n      ";
    return buffer;}

    buffer += "<div class=\"game-board game-map\">\n  ";
    foundHelper = helpers.attributes;
    stack1 = foundHelper || depth0.attributes;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.tiles);
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</div>\n<div class=\"game-board map-overlay\" id=\"map-overlay\" style=\"width: 1000px; height: 1000px;\">\n</div>\n";
    foundHelper = helpers.multiplier;
    stack1 = foundHelper || depth0.multiplier;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "multiplier", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\n";
    return buffer;});
}});

window.require.define({"views/templates/home": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<header>\n  <h1>Yeticorn</h1>\n</header>\n\n<form method=\"post\" action=\"/\">\n\n  <div class=\"select-player\">\n    <a href=\"#\">Carl</a>\n    <a href=\"#\">???</a>\n  </div>\n\n  <div>\n    <input type=\"text\" placeholder=\"Player Name\" />\n  </div>\n\n  <p>\n    Meet Carl.\n  </p>\n\n  <p>\n    Carl has a bad habit of leaving \"The Gaga Pit of Doom\"\n    and seeking out lost wanderers for dinner.\n  </p>\n\n  <div>\n    <input type=\"submit\" value=\"Next &raquo;\" />\n  </div>\n\n</form>";});
}});

