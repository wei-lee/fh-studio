var Apps = Apps || {};
Apps.Tab = Apps.Tab || {};

Apps.Tab.Manager = Tab.Manager.extend({

  init: function() {
    this.initFn = _.once(this.showListapps);
  },

  show: function () {
    // purposely overwrite super's show and don't call it

    // this tab manager is made up of 2 tab managers
    // - list.apps.tab.manager
    // - manage.apps.tab.manager

    // TODO: state restoration
    this.initFn();
  },

  showListapps: function () {
    console.log('showListapps');
    $('#manage_apps_layout').hide();
    $('#list_apps_layout').show();
    if ('undefined' === typeof this.listapps) {
      this.listapps = new ListappsTabManager();
    }
    this.listapps.show();
  },

  showManageapps: function (cb) {
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

  init: function () {
    this._super();

    $('#manage_apps_layout').hide();
    $('#list_apps_layout').show();
  },

  show: function () {
    this._super();
  }

});

ManageappsTabManager = Tab.Manager.extend({
  id: 'manage_apps_layout',

  init: function () {
    this._super();
  },

  show: function (cb) {
    this._super();

    $('#list_apps_layout').hide();
    $('#manage_apps_layout').show();

    // Reload preview
    $fw_manager.client.preview.show();

    if ($.isFunction(cb)) {
      callback(cb);
    }
  }

});