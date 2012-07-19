var Admin = Admin || {};

Admin.Storeitems = Admin.Storeitems || {};

Admin.Storeitems.Controller = Controller.extend({
  models: {
    store_item: new model.StoreItem()
  },

  views: {
    store_items: "#admin_store_items",
    store_item_create: "#admin_store_item_create",
    store_item_update: "#admin_store_item_update"
  },

  init: function () {
  },

  show: function(e) {
    console.log('show store items!');
    this.showStoreItems();
  },

  hide: function(e) {
    $.each(this.views, function(k, v) {
      $(v).hide();
    });
  },

  showStoreItems: function() {
    var self = this;
    this.hide();
    $(this.views.store_items).show();
    // this.models.group.list(function(res) {
    //   self.renderGroupTable(res);
    //   self.bindGroupControls();
    // }, function(err) {
    //   console.error(err);
    // }, true);
  }
});