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

  alert_timeout: 3000,

  init: function() {},

  show: function(e) {
    var self = this;
    this.showStoreItems();
  },

  hide: function(e) {
    $.each(this.views, function(k, v) {
      $(v).hide();
    });
  },

  // type: error|success|info
  showAlert: function(type, message) {
    var self = this;
    var alerts_area = $(this.views.store_item_update).find('.alerts');
    var alert = $('<div>').addClass('alert fade in alert-' + type).html(message);
    var close_button = $('<button>').addClass('close').attr("data-dismiss", "alert").text("x");
    alert.append(close_button);
    alerts_area.append(alert);
    // only automatically hide alert if it's not an error
    if ('error' !== type) {
      setTimeout(function() {
        alert.slideUp(function() {
          alert.remove();
        });
      }, self.alert_timeout);
    }
  },

  setStoreIcon: function(data) {
    var icon = $('.store_item_icon', this.views.admin_store_item_update);
    if (data !== '') {
      icon.attr('src', 'data:image/png;base64,' + data);
    } else {
      icon.attr('src', '/studio/static/themes/default/img/store_no_icon.png');
    }
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
      console.log('delete StoreItem: OK');
      self.showStoreItems();
    }, function(err) {
      self.showStoreItems();
      console.log(err);
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
      console.log(err);
    }, false);
  },

  showUpdateStoreItem: function(store_item) {
    var self = this;
    this.hide();

    self.setStoreIcon(store_item.icon);

    // Disable bundle id inputs
    $('.bundle_id, .update_bundle_id', self.views.store_item_update).attr('disabled', 'disabled');

    this.models.auth_policy.list(function(res) {
      var update_view = $(self.views.store_item_update);

      // Remove uploaded status labels
      $('span.label', update_view).remove();

      self.renderAvailableAuthPolicies(res.list, self.views.store_item_update);

      $('.item_guid', update_view).val(store_item.guid);
      $('.item_name', update_view).val(store_item.name);
      $('.item_id', update_view).val(store_item.authToken);
      $('.item_description', update_view).val(store_item.description);

      update_view.show();
      self.renderBinaryUploads(store_item);

      $('.update_store_item', update_view).unbind().click(function(e) {
        e.preventDefault();
        self.updateStoreItem();
        return false;
      });

    }, function(err) {
      console.log(err);
    }, false);
  },

  renderBinaryUploads: function(store_item) {
    var self = this;

    // Config
    var binaries = [{
      id: 'icon_binary',
      destination: null,
      params: [{
        name: 'guid',
        value: store_item.guid
      }, {
        name: 'type',
        value: 'icon'
      }]
    }, {
      id: 'android_binary',
      destination: 'android',
      params: [{
        name: 'guid',
        value: store_item.guid
      }, {
        name: 'type',
        value: 'android'
      }]
    }, {
      id: 'iphone_binary',
      destination: 'iphone',
      params: [{
        name: 'guid',
        value: store_item.guid
      }, {
        name: 'type',
        value: 'iphone'
      }]
    }, {
      id: 'ipad_binary',
      destination: 'ipad',
      params: [{
        name: 'guid',
        value: store_item.guid
      }, {
        name: 'type',
        value: 'ipad'
      }]
    }, {
      id: 'ios_binary',
      destination: 'ios',
      params: [{
        name: 'guid',
        value: store_item.guid
      }, {
        name: 'type',
        value: 'ios'
      }]
    }];

    $.each(binaries, function(i, binary) {
      var input = $('#' + binary.id);
      if (input.length < 1) {
        return console.error('Input not found: ' + binary.id);
      }

      // Render Binary config
      var row = input.parents('tr');
      if ($(row).has('.bundle_id').length > 0) {
        var bundle_config_input = $('.bundle_id', row);
        var config = self._configForDestination(store_item, binary.destination);
        if (config) {
          bundle_config_input.val(config.bundle_id);
        }
      }

      // Inject binary upload progress template
      var progress_area = $('#binary_upload_progress_template').clone();
      var status = $('.status', progress_area);
      var progress_bar = $('.progress', progress_area);
      progress_area.removeAttr('id');
      input.after(progress_area);

      // Does a binary already exist?
      var binary_upload_status = self._resolveUploadStatus(binary.destination, store_item);
      var status_el = $('#binary_upload_status').clone().removeAttr('id').removeClass('hidden_template');

      if (binary_upload_status === true) {
        // Uploaded
        status_el.text('Uploaded').removeClass('label-inverse').addClass('label-success');
        input.before(status_el);

        // Enable config setting
        input.parents('tr').find('.bundle_id, .update_bundle_id').removeAttr('disabled');
      } else {
        // Not uploaded
        status_el.text('Not Uploaded');
        input.before(status_el);
      }

      // Setup file upload
      input.fileupload({
        url: Constants.ADMIN_STORE_ITEM_UPLOAD_BINARY_URL,
        dataType: 'json',
        replaceFileInput: false,
        formData: binary.params,
        add: function(e, data) {
          // Need to check the event target ID to get around a strange bug
          // If files are dropped onto an input, all of them call this add callback
          // so you need to find out if the event correlates to this particular field
          if (e.target.id === binary.id) {
            progress_area.show();
            status.text('Uploading...');
            status.slideDown();
            progress_bar.slideDown();
            data.submit();
          }
        },
        done: function(e, data) {
          if (data.result.status === 'ok') {
            var filename = data.files[0].name;
            status.text('Uploaded ' + filename);
            status_el.text('Uploaded ' + filename).removeClass('label-inverse').addClass('label-success');
            // Enable config setting
            input.parents('tr').find('.bundle_id, .update_bundle_id').removeAttr('disabled');

            // Set icon
            if (typeof data.result.icon !== 'undefined') {
              self.setStoreIcon(data.result.icon);
            }

            setTimeout(function() {
              progress_bar.slideUp();
              status.slideUp();
            }, 500);
          } else {
            // Show error
            status.text('Error: ' + data.result.message);
            status_el.text('Error').removeClass('label-inverse').addClass('label-danger');
            setTimeout(function() {
              progress_bar.slideUp();
              status.slideUp();
            }, 500);
          }
        },
        progressall: function(e, data) {
          var progress = parseInt(data.loaded / data.total * 100, 10);
          $('.bar', progress_bar).css('width', progress + '%');
        }
      });

    });
  },

  _resolveUploadStatus: function(destination, store_item) {
    var uploaded = null;
    if (destination) {
      // App Binary check
      var binaries = store_item.binaries;

      // No uploaded binaries
      if (binaries.length === 0) {
        return false;
      }

      $.each(binaries, function(i, binary) {
        if (binary.type == destination) {
          uploaded = true;
        }
      });
    } else {
      // Icon check
      if (store_item.icon !== '') {
        return true;
      } else {
        return false;
      }
    }
    return uploaded;
  },

  _configForDestination: function(store_item, destination) {
    var config = null;
    $.each(store_item.binaries, function(i, binary) {
      if (binary.type === destination) {
        config = binary.config;
      }
    });
    return config;
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
      console.log('update StoreItem: OK');
      self.showStoreItems();
    }, function(err) {
      console.log(err);
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

    var update_config = $('.update_bundle_id', self.views.store_item_update);
    update_config.unbind().click(function() {
      var input = $(this).parents('tr').find('.bundle_id');
      var destination = input.attr('data-destination');
      var bundle_id = input.val();
      var guid = $('.item_guid', self.views.store_item_update).val();
      self.updateStoreItemConfig(guid, destination, bundle_id);
      return false;
    });

    this.bindSwapSelect(this.views.store_item_create);
    this.bindSwapSelect(this.views.store_item_update);
  },

  updateStoreItemConfig: function(guid, destination, bundle_id) {
    var self = this;
    this.models.store_item.updateConfig(guid, destination, bundle_id, function(res) {
      self.showAlert('success', "Store Item config updated");
    }, function(err) {
      self.showAlert('error', "Store Item config couldn't be updated");
    });
  },

  createStoreItem: function() {
    var self = this;
    var container = $(this.views.store_item_create);
    var name = $('.item_name', container).val();
    var item_id = $('.item_id', container).val();
    var description = $('.item_description', container).val();
    var auth_policies = this._selectedAuthPolicies(container);

    this.models.store_item.create(name, item_id, description, auth_policies, function(res) {
      console.log('create StoreItem: OK');
      self.showStoreItems();
    }, function(err) {
      console.log(err);
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