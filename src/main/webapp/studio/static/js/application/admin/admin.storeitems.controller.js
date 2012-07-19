var Admin = Admin || {};

Admin.Storeitems = Admin.Storeitems || {};

Admin.Storeitems.Controller = Controller.extend({
  models: {
    store_item: new model.StoreItem()
  },

  views: {
    store_items: "#admin_store_items",
    store_item: "#admin_store_item",
    store_item_create: "#admin_store_item_create",
    store_item_update: "#admin_store_item_update"
  },

  init: function() {},

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
    this.models.store_item.list(function(res) {
      var store_items = res.store_items;
      self.renderItems(store_items);
    }, function(err) {
      console.error(err);
    }, true);
  },

  renderItems: function(store_items) {
    var self = this;
    var list = $(this.views.store_items);
    $.each(store_items, function(i, store_item) {
      var list_item = $(self.views.store_item).clone().show().removeAttr('id');
      list_item.find('.description').text(store_item.name);
      list_item.appendTo(list);
    })
  }
});