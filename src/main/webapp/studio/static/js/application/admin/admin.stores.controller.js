var Admin = Admin || {};

Admin.Stores = Admin.Stores || {};

Admin.Stores.Controller = Controller.extend({
  models: {
    app_store: new model.AppStore()
  },

  views: {
    app_store: "#admin_app_store"
  },

  init: function() {
    // TODO: implement Stores stuff
  },

  hide: function() {
    $.each(this.views, function(k, v) {
      $(v).hide();
    });
  },

  show: function() {
    this.showAppStoreUpdate();
  },

  showAppStoreUpdate: function() {
    var self = this;
    this.hide();
    $(this.views.app_store).show();
  }
});