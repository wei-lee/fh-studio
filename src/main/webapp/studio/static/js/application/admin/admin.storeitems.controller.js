var Admin = Admin || {};

Admin.Storeitems = Admin.Storeitems || {};

Admin.Storeitems.Controller = Controller.extend({
  models: {
    store_item: new model.StoreItem(),
    auth_policy: new model.ArmAuthPolicy()
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
      var store_items = res.list;
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
      list_item.data('store_item', store_item);
      list_item.find('.details h3').text(store_item.name);
      list_item.find('.details p').text(store_item.description);
      if (store_item.icon !== '') {
        list_item.find('img').attr('src', 'data:image/png;base64,' + store_item.icon);
      } else {
        list_item.find('img').attr('src', '/studio/static/themes/default/img/store_no_icon.png');
      }
      list_item.find('.delete_store_item').unbind().click(function() {
        var guid = store_item.guid;
        var okay = confirm("Are you sure you want to delete this Store Item?");
        if (okay) {
          self.deleteStoreItem(guid);
        }
      });

      list_item.find('.edit_store_item').unbind().click(function() {
        self.showUpdateStoreItem(store_item);
      });

      list_item.appendTo(list);
    });

    this.bind();
  },

  deleteStoreItem: function(guid) {
    var self = this;
    this.models.store_item.remove(guid, function(res) {
      Log.append('delete StoreItem: OK');
      self.showStoreItems();
    }, function(err) {
      self.showStoreItems();
      Log.append(err);
    });
  },

  showCreateStoreItem: function() {
    var self = this;
    this.hide();
    this.models.auth_policy.list(function(res) {
      $(self.views.store_item_create).show();
      self.bind();
      self.renderAvailableAuthPolicies(res.list, self.views.store_item_create);
    }, function(err) {
      Log.append(err);
    }, false);
  },

  showUpdateStoreItem: function(store_item) {
    var self = this;
    this.hide();

    this.models.auth_policy.list(function(res) {
      var update_view = $(self.views.store_item_update);
      self.renderAvailableAuthPolicies(res.list, self.views.store_item_update);

      $('.item_guid', update_view).val(store_item.guid);
      $('.item_name', update_view).val(store_item.name);
      $('.item_id', update_view).val(store_item.authToken);
      $('.item_description', update_view).val(store_item.description);

      update_view.show();

      // Bind Binary upload fields
      var icon_upload_field = $('.store_item_icon', self.views.store_item_update);
      var icon_upload_status_area = $('.store_item_icon_status', self.views.store_item_update);
      icon_upload_field.fileupload({
        url: Constants.ADMIN_STORE_ITEM_UPLOAD_BINARY_URL,
        dataType: 'json',
        replaceFileInput: false,
        formData: [{
          name: 'guid',
          value: store_item.guid
        }, {
          name: 'type',
          value: 'icon'
        }],
        add: function(e, data) {
          icon_upload_status_area.text('Uploading...');
          data.submit();
        },
        done: function(e, data) {
          var filename = data.files[0].name;
          icon_upload_status_area.text('Uploaded ' + filename);
        },
        progressall: function(e, data) {
          // console.log(data);
        }
      });

      $('.update_store_item', update_view).unbind().click(function(e) {
        e.preventDefault();
        self.updateStoreItem();
        return false;
      });

    }, function(err) {
      Log.append(err);
    }, false);
  },

  updateStoreItem: function() {
    var self = this;
    var container = $(this.views.store_item_update);

    var name = $('.item_name', container).val();
    var item_id = $('.item_id', container).val();
    var description = $('.item_description', container).val();
    var auth_policies = this._selectedAuthPolicies(container);
    var guid = $('.item_guid', container).val();

    this.models.store_item.update(guid, name, item_id, description, auth_policies, function(res) {
      Log.append('update StoreItem: OK');
      self.showStoreItems();
    }, function(err) {
      Log.append(err);
    });
  },

  renderAvailableAuthPolicies: function(auth_policies, container) {
    var available_select = $('.store_item_available_auth_policies', container);
    available_select.empty();
    var assigned_select = $('.store_item_assigned_auth_policies', container);
    assigned_select.empty();
    $.each(auth_policies, function(i, policy) {
      var option = $('<option>').val(policy.policyId).text(policy.policyId);
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
    create_button.unbind().click(function() {
      self.createStoreItem();
      return false;
    });

    this.bindSwapSelect(this.views.store_item_create);
  },

  createStoreItem: function() {
    var self = this;
    var container = $(this.views.store_item_create);
    var name = $('.item_name', container).val();
    var item_id = $('.item_id', container).val();
    var description = $('.item_description', container).val();
    var auth_policies = this._selectedAuthPolicies(container);

    this.models.store_item.create(name, item_id, description, auth_policies, function(res) {
      Log.append('create StoreItem: OK');
      self.showStoreItems();
    }, function(err) {
      Log.append(err);
    });
  },

  _selectedAuthPolicies: function(container) {
    var policy_options = $('.store_item_assigned_auth_policies option', container);
    var policies = [];
    policy_options.each(function(i, item) {
      policies.push($(item).val());
    });
    return policies;
  }
});