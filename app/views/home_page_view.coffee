template = require 'views/templates/home'
PageView = require 'views/base/page_view'

module.exports = class HomePageView extends PageView
  template: template
  className: 'home-page'
  events:
    'submit form': 'submitForm'

  submitForm: (e) ->
    false