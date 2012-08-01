var Admin = Admin || {};

Admin.Stores = Admin.Stores || {};

Admin.Stores.Controller = Controller.extend({
  models: {
    app_store: new model.AppStore(),
    store_item: new model.StoreItem(),
    auth_policy: new model.ArmAuthPolicy()
  },

  alert_timeout: 3000,

  views: {
    app_store: '#admin_app_store'
  },

  // type: error|success|info
  showAlert: function(type, message) {
    var self = this;
    var alerts_area = $(this.views.app_store).find('.alerts');
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

  init: function() {},

  hide: function() {
    $.each(this.views, function(k, v) {
      $(v).hide();
    });
  },

  show: function() {
    var self = this;
    self.models.app_store.read(function(app_store_res) {
      $('.store_guid', self.views.app_store).val(app_store_res.guid);
      self.setStoreIcon(app_store_res.icon);
      self.models.store_item.list(function(store_items_res) {
        self.models.auth_policy.list(function(auth_policy_res) {
          // Render swap selects
          var available_store_items = store_items_res.list;
          var assigned_store_items = app_store_res.storeitems;
          self.renderAvailableStoreItems(available_store_items, assigned_store_items, self.views.app_store);

          var available_auth_policies = auth_policy_res.list;
          var assigned_auth_policies = app_store_res.authpolicies;
          self.renderAvailableAuthPolicies(available_auth_policies, assigned_auth_policies, self.views.app_store);

          self.bind();
          self.showAppStoreUpdate(app_store_res);
        }, function(err) {
          self.showAlert('error', "Error loading App Store Store Items");
        }, false);
      }, function(err) {
        self.showAlert('error', "Error loading App Store Store Items");
      }, true);
    }, function() {
      self.showAlert('error', "Error loading App Store");
    });
  },

  setStoreIcon: function(data) {
    var icon = $('.store_icon', this.views.app_store);
    if (data !== '') {
      icon.attr('src', 'data:image/png;base64,' + data);
    } else {
      icon.attr('src', '/studio/static/themes/default/img/store_no_icon.png');
    }
  },

  bind: function() {
    var self = this;
    self.bindSwapSelect(self.views.app_store);
    $('.update_app_store', self.views.app_store).unbind().click(function(e) {
      self.updateAppStore();
      return false;
    });

    var input = $('.app_store_icon', this.views.app_store).fileupload('destroy');

    // Inject binary upload progress template
    var progress_area = $('#binary_upload_progress_template').clone();
    var status = $('.status', progress_area);
    var progress_bar = $('.progress', progress_area);
    progress_area.removeAttr('id');
    input.after(progress_area);

    input.fileupload({
      url: Constants.ADMIN_APP_STORE_UPLOAD_BINARY_URL,
      dataType: 'json',
      replaceFileInput: false,
      add: function(e, data) {
        // Check to see if App Store admin visible
        // Fixes a weird multiple upload triggering bug
        if ($(self.views.app_store).is(':visible')) {
          progress_area.show();
          status.text('Uploading...');
          status.slideDown();
          progress_bar.slideDown();
          data.submit();
        } else {
          console.log('Not triggering upload: ' + e.target.id);
          return null;
        }
      },
      done: function(e, data) {
        if (data.result.status === 'ok') {
          var filename = data.files[0].name;
          status.text('Uploaded ' + filename);
          self.showAlert('success', 'Icon successfully uploaded');

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
          self.showAlert('error', data.result.message);
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
  },

  renderAvailableStoreItems: function(available, assigned, container) {
    var self = this;
    var available_select = $('.app_store_store_items_available', container).empty();
    var assigned_select = $('.app_store_store_items_assigned', container).empty();

    var map = {};

    // Massaging into {v: name, v: name} hash for lookup
    $.each(available, function(i, item) {
      map[item.guid] = item.name;
    });

    // Assigned first
    $.each(assigned, function(i, guid) {
      var name = map[guid];
      var option = $('<option>').val(guid).text(name);
      assigned_select.append(option);
    });

    // Available, minus assigned
    $.each(map, function(guid, name) {
      if (assigned.indexOf(guid) == -1) {
        var option = $('<option>').val(guid).text(name);
        available_select.append(option);
      }
    });
  },

  renderAvailableAuthPolicies: function(available, assigned, container) {
    var self = this;
    var available_select = $('.app_store_available_auth_policies', container).empty();
    var assigned_select = $('.app_store_assigned_auth_policies', container).empty();

    var map = {};

    // Massaging into {v: name, v: name} hash for lookup
    $.each(available, function(i, item) {
      map[item.guid] = item.policyId;
    });

    // Assigned first
    $.each(assigned, function(i, guid) {
      var name = map[guid];
      var option = $('<option>').val(guid).text(name);
      assigned_select.append(option);
    });

    // Available, minus assigned
    $.each(map, function(guid, name) {
      if (assigned.indexOf(guid) == -1) {
        var option = $('<option>').val(guid).text(name);
        available_select.append(option);
      }
    });
  },

  updateAppStore: function() {
    var self = this;
    var container = this.views.app_store;
    var guid = $('.store_guid', container).val();
    var name = $('.store_name', container).val();
    var description = $('.store_description', container).val();
    var store_items = this._selectedStoreItems(container);
    var auth_policies = this._selectedAuthPolicies(container);

    this.models.app_store.update(guid, name, description, store_items, auth_policies, function(res) {
      self.showAlert('success', "App Store updated successfully");
    }, function(err) {
      self.showAlert('error', err);
    }, true);
  },

  _selectedStoreItems: function(container) {
    var store_item_options = $('.app_store_store_items_assigned option', container);
    var items = [];
    store_item_options.each(function(i, item) {
      items.push($(item).val());
    });
    return items;
  },

  _selectedAuthPolicies: function(container) {
    var options = $('.app_store_assigned_auth_policies option', container);
    var items = [];
    options.each(function(i, item) {
      items.push($(item).val());
    });
    return items;
  },

  showAppStoreUpdate: function(store) {
    this.hide();
    var container = $(this.views.app_store);
    $('.store_name', container).val(store.name);
    $('.store_description', container).val(store.description);
    container.show();
  }
});