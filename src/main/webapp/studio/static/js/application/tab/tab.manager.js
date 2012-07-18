var Tab = Tab || {};
Tab.Manager = Class.extend({
  controllers: {},
  inited: false,

  init: function () {

  },

  show: function () {
    if (!this.inited) {
      this.inited = true;

      var self = this;
      var el = $('#' + this.id);
      var navList = el.find('.nav-list');
      var crumb = el.find('.breadcrumb');

      // bind events to each navlist items
      navList.find('a').each(function (index, element) {
        var jqEl = $(this);
        var controllerName = jqEl.data('controller');

        // resolve the right controller for the navlist item
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

        // handler for when navlist item is clicked
        jqEl.on('click', function (e) {
          // update active status of navlist
          navList.find('li').removeClass('active');
          jqEl.closest('li').addClass('active');

          // udpate breadcrumbs
          var crumbs = [jqEl.text()];
          var header = jqEl.closest('li').prev('.nav-header');
          if (header.length > 0) {
            crumbs.unshift(header.text());
          }
          self.updateCrumbs(crumbs);

          // tell controller we're ready for it to do it's thing
          controller.show();
        });
      });

      // meh, lets start with first item
      // TODO: state stuff here
      navList.find('a:eq(0)').trigger('click');
    }
  },

  // see http://twitter.github.com/bootstrap/components.html#breadcrumbs
  updateCrumbs: function (crumbs) {
    var el = $('#' + this.id);
    var crumb = el.find('.breadcrumb').empty();

    for (var ci = 0, cl = crumbs.length; ci < cl; ci += 1) {
      var ct = crumbs[ci];

      if (ci !== (cl - 1)) {
        // non-final crumb
        crumb.append($('<li>').append($('<a>', {
          "href": "#",
          "text": ct
        }).on('click', function (e) {
          // TODO: implement
          console.error('IMPLEMENT breadcrumb click');
        })).append($('span', {
          "class": "divider",
          "text": "/"
        })));
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