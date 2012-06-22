application.controller.Keys = Class.extend({
  init: function() {
    Log.append('Keys controller init');
    this.model = new application.model.UserKey();
  },

  refreshClipboardPaste: function() {
    Log.append('Refreshing copy and paste.');
    // Destroy existing agents
    $.each(ZeroClipboard.clients, function(i, client) {
      client.destroy();
    });
    $("#keys_manage_body .user_key .copy:visible").each(function() {
      var clip = new ZeroClipboard.Client();
      clip.glue(this);

      clip.addEventListener('mouseDown', function(client) {
        var text = $(client.domElement).parent().find('.key_public').text();
        clip.setText(text);
        $fw_manager.client.dialog.info.flash('Your key has been copied to your clipboard.');
      });
    });
  },

  bind: function() {
    var self = this;
    setTimeout(function() {
      self.refreshClipboardPaste();
    }, 100); // :(
    $('#keys_manage_body .show_generate').unbind().click(function() {
      self.toggleGenerateKeyForm();
    });

    $('#keys_manage_body button.generate_user_key').unbind().click(function() {
      var key_label = $('input[name=key_label]').val();
      self.generateUserKey(key_label);
      return false;
    });

    $('#keys_manage_body .user_key .revoke').unbind().click(function() {
      var confirmation = confirm("Are you sure you want to revoke this API key? This cannot be undone.");
      if (confirmation) {
        var key = $(this).parent().parent().find('.key_public').text();
        self.revokeUserKey(key);
      }
    });

    $('#keys_manage_body .user_key .edit, #keys_manage_body .user_key .update').unbind().click(function() {
      if ($(this).hasClass('disabled')) {
        $fw_manager.client.dialog.info.flash('This key has been revoked and cannot be altered');
        return;
      }

      var label_span = $(this).parent().parent().find('span.key_label');
      var label_input = $(this).parent().parent().find('input.key_label');
      var edit_button = $(this).parent().parent().find('div.operations .edit');
      var update_button = $(this).parent().parent().find('div.operations .update');
      var key = $(this).parent().parent().find('.key_public').text();
      self.toggleLabelEdit(label_span, label_input, edit_button, update_button, key);
    });
  },

  toggleLabelEdit: function(label_span, label_input, edit_button, update_button, key) {
    if ($(label_span).is(":visible")) {
      // Not currently editing
      var width = label_span.width() || 50;
      label_span.hide();
      edit_button.hide();
      update_button.show();
      update_button.removeClass('hidden');
      label_input.removeClass('hidden');
      label_input.val(label_span.text());
      label_input.css('width', width + 'px');
      label_input.show();
    } else {
      // Model update
      var label = label_input.val();
      Log.append('Updating key label: ' + key);
      var self = this;
      this.model.update(key, label, function(res) {
        if (res.status == 'ok') {
          label_input.hide();
          edit_button.show();
          update_button.hide();
          label_span.text(label_input.val());
          label_span.show();
          self.refreshUserKeys();
        } else {
          $fw_manager.client.dialog.info.flash('Failed to update your key. Please try again.');
        }
      });
    }
  },

  revokeUserKey: function(key) {
    Log.append('revoking: ' + key);
    var self = this;
    this.model.revoke(key, function(res) {
      if (res.status === 'ok') {
        self.refreshUserKeys();
      }
    });
  },

  generateUserKey: function(key_label) {
    var self = this;
    this.model.create(key_label, function(res) {
      if (res.status == 'ok') {
        self.refreshUserKeys();
      } else {
        $fw_manager.client.dialog.info.flash('Failed to generate your key - you may need to add a label. Please try again.');
      }
    });
  },

  toggleGenerateKeyForm: function() {
    var self = this;
    if ($('.generate_user_key_form:visible').length > 0) {
      // Showing
      $('.generate_user_key_form').slideUp(function() {
        self.refreshClipboardPaste();
      });
    } else {
      // Not showing, show
      $('.generate_user_key_form').slideDown(function() {
        self.refreshClipboardPaste();
      });
    }
  },

  refreshUserKeys: function() {
    var self = this;
    this.model.load(function(res) {
      Log.append('Keys show - model loaded');

      if (res.status == 'ok') {
        self.renderUserKeys();
      } else {
        // Show error
      }
    });
  },

  show: function() {
    var self = this;
    this.bind();
    Log.append('Keys controller show');
    this.refreshUserKeys();
  },

  renderUserKeys: function() {
    var list_container = $('#user_key_list');
    list_container.find('.user_key').remove();
    var user_keys = this.model.all;

    if (user_keys.length > 0) {
      $.each(user_keys, function(i, user_key) {
        var list_item = $('.hidden_template.user_key').clone().removeClass('hidden_template');
        list_item.find('span.key_label').text(user_key.label);
        list_item.find('span.key_public').text(user_key.key);

        if (user_key.revokedBy) {
          list_item.addClass('revoked');
          list_item.find('.key_revoked_details .email').text(user_key.revokedEmail);
          list_item.find('.key_revoked_details .timestamp').text(user_key.revoked);
          list_item.find('.operations .revoke').addClass("disabled");
          list_item.find('.operations .edit').addClass("disabled");
          list_item.find('.key_revoked_details').removeClass('hidden');
        }
        list_container.append(list_item);
      });
    } else {
      var list_item = $('.hidden_template.user_key').clone().removeClass('hidden_template');
      list_item.find('span.key_label').text('You currently have no keys.');
      list_item.find('span.key_public, div.operations').remove();
      list_item.find('span.key_public, img.copy').remove();
      list_container.append(list_item);
    }
    // Rebind
    this.bind();
  },

  showAlert: function(type, message) {
    var self = this;
    var alert_area = $('.hidden_template.alert_area:first').clone(false);
    alert_area.find('a.close').unbind().click(function() {
      $(this).parent().slideUp(function() {
        $(this).remove();
      });
    });
    alert_area.find('strong.alert_type').text(type);
    alert_area.find('span.alert_message').text(message);
    $('#user_key_list').prepend(alert_area);
    alert_area.slideDown(function() {
      self.refreshClipboardPaste();
    });
  }
});

application.model.UserKey = Class.extend({
  all: null,

  init: function() {},

  update: function(key, label, cb) {
    var self = this;
    var url = Constants.KEY_UPDATE_URL;
    var params = {
      "key": key,
      "fields": {
        "label": label
      }
    };

    $fw.server.post(url, params, function(res) {
      cb(res);
    });
  },

  create: function(key_label, cb) {
    var self = this;
    var url = Constants.KEY_CREATE_URL;
    var params = {
      type: "user",
      label: key_label
    };

    $fw.server.post(url, params, function(res) {
      cb(res);
    });
  },

  revoke: function(key, cb) {
    var self = this;
    var url = Constants.KEY_REVOKE_URL;
    var params = {
      key: key
    };

    $fw.server.post(url, params, function(res) {
      cb(res);
    });
  },

  load: function(cb) {
    var self = this;
    Log.append('Keys model loading');
    var url = Constants.KEY_LIST_URL;
    var params = {
      type: "user"
    };

    $fw.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.all = self._transform(res.list);
      }
      cb(res);
    });
  },

  _transform: function(list) {
    var self = this;
    $.each(list, function(i, item) {
      item.revoked = self._formatTimestamp(item.revoked);
    });
    return list;
  },

  _formatTimestamp: function(ts) {
    if (!ts) {
      return null;
    }

    var timestamp = moment(ts).format('DD/MM/YYYY, HH:mm:ss');
    return timestamp;
  }
});
