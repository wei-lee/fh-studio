var Admin = Admin || {};

Admin.Stores = Admin.Stores || {};

Admin.Stores.Controller = Controller.extend({
  models: {
    app_store: new model.AppStore()
  },

  views: {
    app_store: '#admin_app_store'
  },

  init: function() {},

  hide: function() {
    $.each(this.views, function(k, v) {
      $(v).hide();
    });
  },

  show: function() {
    // TODO: Check App Store existence (read automatically creates Store if it doesn't exist)
    var store_exists = false;
    this.showAppStoreUpdate();
  },


  showAppStoreUpdate: function() {
    this.hide();
    $(this.views.app_store).show();
  }
});