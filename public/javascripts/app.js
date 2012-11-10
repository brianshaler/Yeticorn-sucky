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
  var Application, GameSetupView, GameView, IntroView, PlayerSetupView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
      return this.clickedPlay = _.once(this.clickedPlay);
    };

    Application.prototype.start = function() {
      return this.connectSocket();
    };

    Application.prototype.connectSocket = function() {
      var _this = this;
      this.socket = io.connect(window.location.href);
      this.socket.on('intro.show', function() {
        console.log('show');
        return _this.intro();
      });
      return this.socket.on('gameSetup.show', function(id) {
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
      return this.socket.emit('playerSetup.submit', this.playerSetupView.getName());
    };

    Application.prototype.gameSetup = function() {
      window.location.hash = id;
      this.gameSetupView = new GameSetupView();
      return this.gameSetupView.render();
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

    GameSetupView.prototype.className = 'game-setup';

    GameSetupView.prototype.render = function() {
      $('#page-container').html('');
      this.$el.appendTo('#page-container');
      return this.$el.html(this.template());
    };

    return GameSetupView;

  })(Backbone.View);
  
}});

window.require.define({"views/game_view": function(exports, require, module) {
  var GameView, template,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  template = require('views/templates/game');

  module.exports = GameView = (function(_super) {

    __extends(GameView, _super);

    function GameView() {
      return GameView.__super__.constructor.apply(this, arguments);
    }

    GameView.prototype.template = template;

    GameView.prototype.className = 'game';

    GameView.prototype.render = function() {
      $('#page-container').html('');
      this.$el.appendTo('#page-container');
      return this.$el.html(this.template());
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
    var buffer = "", foundHelper, self=this;


    return buffer;});
}});

window.require.define({"views/templates/game_setup": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<header>\n  <h1>Yeticorn</h1>\n</header>\n\n<form method=\"post\" action=\"/\">\n\n  <div class=\"select-player\">\n    <a href=\"#\">Carl</a>\n    <a href=\"#\">???</a>\n  </div>\n\n  <div>\n    <input type=\"text\" placeholder=\"Player Name\" />\n  </div>\n\n  <p>\n    Meet Carl.\n  </p>\n\n  <p>\n    Carl has a bad habit of leaving \"The Gaga Pit of Doom\"\n    and seeking out lost wanderers for dinner.\n  </p>\n\n  <div>\n    <input type=\"submit\" value=\"Next &raquo;\" />\n  </div>\n\n</form>";});
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

