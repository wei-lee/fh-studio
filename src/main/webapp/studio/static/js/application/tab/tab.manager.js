/*jshint evil:true */
var Tab = Tab || {};
Tab.Manager = Class.extend({

  init: function () {
    this.initFn = _.once(this.initBindings);
    this.postFn = _.after(2, this.afterBindings);
  },

  show: function () {
    var self = this;
    var el = $('#' + this.id);
    var navList = el.find('.nav-list');

    this.initFn();
    this.postFn();

    self.updateCrumbs.call(navList.find('li.active a')[0], self);
  },

  initBindings: function () {
    var self = this;
    var el = $('#' + this.id);
    var navList = el.find('.nav-list');

    // bind events to each navlist items
    navList.find('a').each(function (index, element) {
      var jqEl = $(this);
      var controllerName = jqEl.data('controller');

      // resolve the right controller for the navlist item
      var controller = self.getController(controllerName);

      // handler for when navlist item is clicked
      jqEl.on('click', function (e) {
        e.preventDefault();
        // tell all controllers to hide themselves
        self.hideAll();

        self.updateCrumbs.call(this, self);
        // tell active controller we're ready for it to do it's thing
        controller.show(e);

        return false;
      });
    });

    // meh, lets start with first item
    // TODO: state stuff here
    el.find('.layout-content').show();
    navList.find('li:visible a:eq(0)').trigger('click');
  },

  afterBindings: function () {
    var el = $('#' + this.id);
    var navList = el.find('.nav-list');
    navList.find('li.active:visible a').trigger('click');
  },

  getController: function (controllerName) {
    var self = this;
    
    // NOTE: we initialise to an emtpy object here rather than have it as a field due to
    //       bug/feature of Class where all sub classes have a reference to the same field
    //       http://ejohn.org/blog/simple-javascript-inheritance/
    if (self.controllers == null) {
      self.controllers = {};
    }
    if ('undefined' === typeof self.controllers[controllerName]) {
      var upperName = self.toUpper(controllerName);
      try {
        self.controllers[controllerName] = new (eval(upperName))(); // ok to use eval here
      } catch (e) {
        console.error('Make sure ' + upperName + ' is loaded and defined');
        throw e;
      }
    }

    return self.controllers[controllerName];
  },

  // calls hide on all controllers
  hideAll: function () {
    for (var key in this.controllers) {
      var temp = this.controllers[key];
      temp.hide();
    }
  },

  // see http://twitter.github.com/bootstrap/components.html#breadcrumbs
  updateCrumbs: function (self) {
    console.log('updateCrumbs');
    var crumb;

    var el = $('#' + self.id);
    var navList = el.find('.nav-list');
    var jqEl = $(this);
    // update active status of navlist
    navList.find('li').removeClass('active');
    jqEl.closest('li').addClass('active');

    // udpate breadcrumbs
    var crumbs = [jqEl.text()];
    var header = jqEl.closest('li').prevAll('.nav-header:eq(0)');
    if (header.length > 0) {
      crumbs.unshift(header.text());
    }

    if (self.breadcrumbId != null) {
      crumb = $('#' + self.breadcrumbId).empty();
    } else {
      crumb = $('#' + self.id).find('.breadcrumb').empty();
    }

    for (var ci = 0, cl = crumbs.length; ci < cl; ci += 1) {
      var ct = crumbs[ci];

      if (ci !== (cl - 1)) {
        // non-final crumb
        crumb.append($('<li>', {
          //"href": "#",
          "text": ct
        })).append($('<span>', {
          "class": "divider",
          "text": "/"
        }));
      } else {
        // final crumb
        crumb.append($('<li>', {
          "class": "active",
          "text": ct
        }));
      }
    }
  },

  toUpper: function (str) {
    return str.toLowerCase().replace(/\b[a-z]/g, function(subStr) {
      return subStr.toUpperCase();
    });
  }
});