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
    self.models.app_store.read(function(app_store_res) {
      $('.store_guid', self.views.app_store).val(app_store_res.guid);
      self.setStoreIcon(app_store_res.icon);
      self.models.store_item.list(function(store_items_res) {
        var store_items = store_items_res.list;
        self.renderAvailableStoreItems(store_items, self.views.app_store);
        self.bind();
        self.showAppStoreUpdate(app_store_res);
      }, function(err) {
        console.error(err);
      }, true);
    }, function() {
      log("Error loading App Store");
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
    $('.update_app_store', self.views.app_store).unbind().click(function(e){
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
        progress_area.show();
        status.text('Uploading...');
        status.slideDown();
        progress_bar.slideDown();
        data.submit();
      },
      done: function(e, data) {
        var filename = data.files[0].name;
        self.setStoreIcon(data.result.icon);        
        status.text('Uploaded ' + filename);
        setTimeout(function() {
          progress_bar.slideUp();
        }, 500);
      },
      progressall: function(e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('.bar', progress_bar).css('width', progress + '%');
      }
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

  updateAppStore: function() {
    var container = this.views.app_store;
    var guid = $('.store_guid', container).val();
    var name = $('.store_name', container).val();
    var description  = $('.store_description', container).val();
    var store_items = this._selectedStoreItems(container);

    this.models.app_store.update(guid, name, description, store_items, function(res) {
      console.log(res);
    }, function(err) {
      console.error(err);
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

  showAppStoreUpdate: function(store) {
    this.hide();
    var container = $(this.views.app_store);
    $('.store_name', container).val(store.name);
    $('.store_description', container).val(store.description);
    container.show();
  }
});
