var Admin = Admin || {};

Admin.Storeitems = Admin.Storeitems || {};

Admin.Storeitems.Controller = Controller.extend({
  models: {
    store_item: new model.StoreItem(),
    group: new model.Group()
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
    var self = this;
    this.hide();
    this.models.group.list(function(res) {
      $(self.views.store_item_create).show();
      self.bind();
      self.renderAvailableGroups(res.list);
    }, function(err) {
      Log.append(err);
    });
  },

  renderAvailableGroups: function(available_groups) {
    var available_select = $('.store_item_available_groups', this.views.store_item_create);
    available_select.empty();
    var assigned_select = $('.store_item_assigned_groups', this.views.store_item_create);
    assigned_select.empty();
    $.each(available_groups, function(i, group){
      var option = $('<option>').val(group.guid).text(group.fields.name);
      available_select.append(option);
    });
  },

  bind: function() {
    var self = this;
    var show_create_button = $('.admin_store_items_controls button', self.views.store_items);
    show_create_button.unbind().click(function() {
      self.showCreateStoreItem();
      return false;
    });

    var create_button = $('.create_store_item', self.views.store_item_create);
    create_button.unbind().click(function(){
      self.createStoreItem();
      return false;
    });

    this.bindSwapSelect(this.views.store_item_create);
  },

  createStoreItem: function() {
    var container = $(this.views.store_item_create);
    var name = $('.item_name', container).val();
    var item_id = $('.item_id', container).val();
    var description = $('.item_description', container).val();

    this.models.store_item.create(name, item_id, description, [], function(res) {
      Log.append('create StoreItem: OK');
    }, function(err) {
      Log.append(err);
    });
  }

});