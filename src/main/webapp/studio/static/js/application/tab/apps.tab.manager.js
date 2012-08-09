var Apps = Apps || {};
Apps.Tab = Apps.Tab || {};

Apps.Tab.Manager = Tab.Manager.extend({
  init: function() {
  },

  show: function () {
    // this tab manager is made up of 2 tab managers
    // - list.apps.tab.manager
    // - manage.apps.tab.manager

    // TODO: state restoration
    this.showListapps();
  },

  showListapps: function () {
    $('#manage_apps_layout').hide();
    $('#list_apps_layout').show();
    if ('undefined' === typeof this.listapps) {
      this.listapps = new ListappsTabManager();
    }
    this.listapps.show();
  },

  showManageapps: function () {
    $('#list_apps_layout').hide();
    $('#manage_apps_layout').show();
    if ('undefined' === typeof this.manageapps) {
      this.manageapps = new ManageappsTabManager();
    }
    this.manageapps.show();
  }
});

ListappsTabManager = Tab.Manager.extend({
  id: 'list_apps_layout',

  init: function () {
    this._super();
  }

});

ManageappsTabManager = Tab.Manager.extend({
  id: 'manage_apps_layout',

  init: function () {
    this._super();
  }

});