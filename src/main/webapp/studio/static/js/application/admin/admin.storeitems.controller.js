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
    list.find('li').remove();
    $.each(store_items, function(i, store_item) {
      var list_item = $(self.views.store_item).clone().show().removeAttr('id');
      list_item.find('.details h3').text(store_item.name);
      list_item.find('.details p').text(store_item.description);
      list_item.find('img').attr('src', 'data:image/png;base64,' + store_item.icon);
      list_item.appendTo(list);
    });

    this.bind();
  },

  showCreateStoreItem: function() {
    this.hide();
    $(this.views.store_item_create).show();
  },

  bind: function() {
    var self = this;
    var create_button = $(this.views.store_items).find('.admin_store_items_controls button');
    create_button.unbind().click(function(){
      self.showCreateStoreItem();
    });
  }
});
