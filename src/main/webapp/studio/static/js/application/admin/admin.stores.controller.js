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
    var self = this;
    this.models.app_store.read(function(res) {
      self.showAppStoreUpdate(res);
    }, function() {
      log("Error loading App Store");
    });
  },


  showAppStoreUpdate: function(store) {
    this.hide();
    var container = $(this.views.app_store);
    $('.store_name', container).val(store.name);
    $('.store_description', container).val(store.description);

    container.show();
  }
});
