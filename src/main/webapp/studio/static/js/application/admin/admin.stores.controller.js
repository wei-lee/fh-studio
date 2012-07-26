var Admin = Admin || {};

Admin.Stores = Admin.Stores || {};

Admin.Stores.Controller = Controller.extend({
  models: {
    app_store: new model.AppStore(),
    store_item: new model.StoreItem()
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
    self.models.app_store.read(function(res) {
      self.models.store_item.list(function(res) {
        var store_items = res.list;
        self.renderAvailableStoreItems(store_items, self.views.app_store);
        self.bindSwapSelect(self.views.app_store);
        self.showAppStoreUpdate(res);
      }, function(err) {
        console.error(err);
      }, true);

    }, function() {
      log("Error loading App Store");
    });
  },

  renderAvailableStoreItems: function(store_items, container) {
    var available_select = $('.app_store_store_items_available', container);
    available_select.empty();
    var assigned_select = $('.app_store_store_items_assigned', container);
    assigned_select.empty();
    $.each(store_items, function(i, item) {
      var option = $('<option>').val(item.guid).text(item.name);
      available_select.append(option);
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
