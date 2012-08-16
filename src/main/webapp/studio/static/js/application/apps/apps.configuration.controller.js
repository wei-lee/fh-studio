/*jshint evil:true */
var Apps = Apps || {};

Apps.Configuration = Apps.Configuration || {};

Apps.Configuration.Controller = Apps.Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    configuration_container: "#configuration_container"
  },

  container: null,
  showPreview: true,

  init: function () {
    this.initFn = _.once(this.initBindings);
  },

  initBindings: function () {
    var self = this;

    $(this.views.configuration_container + ' .nav li a').bind('click', function () {
      // bind to configured controller
      var el = $(this);
      var controllerName = el.data('controller');
      var upperName = self.toUpper(controllerName);

      if (self.controllers == null) {
        self.controllers = {};
      }
      if ('undefined' === typeof self.controllers[controllerName]) {
        try {
          self.controllers[controllerName] = new (eval(upperName))(); // ok to use eval here
        } catch (e) {
          console.error('Make sure ' + upperName + ' is loaded and defined');
          throw e;
        }
      }

      self.controllers[controllerName].show();
    });
  },

  show: function(){
    this._super();
    
    this.hide();
    this.container = this.views.configuration_container;
    $(this.container).show();

    this.initFn();

    // if a tab is already visible, reclick it, otherwise, click first visible tab
    var itemToClick = $(this.views.configuration_container + ' .nav li.active:visible a');
    if (itemToClick.length === 0) {
      itemToClick = $(this.views.configuration_container + ' .nav li:visible a:eq(0)');
    }
    itemToClick.trigger('click');
  },

  toUpper: function (str) {
    return str.toLowerCase().replace(/\b[a-z]/g, function(subStr) {
      return subStr.toUpperCase();
    });
  }

});