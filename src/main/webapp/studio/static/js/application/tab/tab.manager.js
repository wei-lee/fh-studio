var Tab = Tab || {};
Tab.Manager = Class.extend({
  controllers: {},

  init: function () {
    // TODO: bind events to nav-list
    var self = this;
    var el = $('#' + this.id);
    var navList = el.find('.nav-list');
    navList.find('a').each(function (index, element) {
      var jqEl = $(this);
      var controllerName = jqEl.data('controller');
      if ('undefined' === typeof self.controllers[controllerName]) {
        var upperName = self.toUpper(controllerName);
        try {
          self.controllers[controllerName] = new (eval(upperName))(); // ok to use eval here
        } catch (e) {
          console.error('Make user ' + upperName + ' is loaded and defined');
          throw e;
        }
      }
      var controller = self.controllers[controllerName];
      jqEl.on('click', function (e) {
        controller.show();
      });
    });

    // TODO: bind breadcrumb updates
    var crumb = el.find('.breadcrumb');

    // TODO: initialise init state of tab

  },

  toUpper: function (str) {
    return str.toLowerCase().replace(/\b[a-z]/g, function(subStr) {
      return subStr.toUpperCase();
    });
  }
});