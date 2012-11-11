if window?
  module.exports = window._
else
  module.exports = require 'underscore'