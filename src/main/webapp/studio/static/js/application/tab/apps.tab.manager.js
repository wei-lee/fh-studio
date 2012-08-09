var Apps = Apps || {};
Apps.Tab = Apps.Tab || {};

Apps.Tab.Manager = Tab.Manager.extend({

  init: function() {
    this.initFn = _.once(this.showListapps);
  },

  show: function() {
    // purposely overwrite super's show and don't call it
    // this tab manager is made up of 2 tab managers
    // - list.apps.tab.manager
    // - manage.apps.tab.manager
    // TODO: state restoration
    this.initFn();
  },

  showListapps: function() {
    console.log('showListapps');
    $('#manage_apps_layout').hide();
    $('#list_apps_layout').show();
    if ('undefined' === typeof this.listapps) {
      this.listapps = new ListappsTabManager();
    }
    this.listapps.show();
  },

  showManageapps: function(cb) {
    $('#list_apps_layout').hide();
    $('#manage_apps_layout').show();
    if ('undefined' === typeof this.manageapps) {
      this.manageapps = new ManageappsTabManager();
    }
    this.manageapps.show(cb);
  }
});

ListappsTabManager = Tab.Manager.extend({
  id: 'list_apps_layout',
  breadcrumbId: 'apps_breadcrumb',

  init: function() {
    this._super();
  },

  show: function() {
    this._super();

    $('#manage_apps_layout').hide();
    $('#list_apps_layout').show();
  }

});

ManageappsTabManager = Tab.Manager.extend({
  id: 'manage_apps_layout',

  init: function() {
    this._super();
  },

  show: function(cb) {
    this._super();

    $('#list_apps_layout').hide();
    $('#manage_apps_layout').show();

    // Reload preview
    $fw_manager.client.preview.show();

    if ($.isFunction(cb)) {
      callback(cb);
    }
  },

  // see http://twitter.github.com/bootstrap/components.html#breadcrumbs
  updateCrumbs: function(self) {
    console.log('custom apps breadcrumbs');
    var prefixCrumb = $('.listapps_nav_list li.active a');

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

    var crumb = $('#apps_breadcrumb').empty().append($('<li>').append($('<a>', {
      "href": "#",
      "text": prefixCrumb.text().trim()
    }).on('click', function(e) {
      e.preventDefault();
      $fw.client.tab.apps.showListapps();
    })).append($('<span>', {
      "class": "divider",
      "text": "/"
    })));

    for (var ci = 0, cl = crumbs.length; ci < cl; ci += 1) {
      var ct = crumbs[ci];

      if (ci !== (cl - 1)) {
        // non-final crumb
        crumb.append($('<li>').append($('<a>', {
          "href": "#",
          "text": ct
        }).on('click', function(e) {
          // TODO: implement
          e.preventDefault();
          console.error('IMPLEMENT breadcrumb click');
        })).append($('<span>', {
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
  }

});