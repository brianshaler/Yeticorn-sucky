if window?
  module.exports = window.Backbone
else
  module.exports = require 'backbone'