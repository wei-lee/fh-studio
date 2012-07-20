application.DialogManager = Class.extend({

  init: function () {
    this.progress = proto.ProgressDialog.load($('#progress_dialog'), {});
    this.connectivity = {
      show: function (text) {
        $('#connectivity_dialog').queue(function () {
          $(this).show().find('p').text(text);
          $(this).dequeue();
        }).fadeIn(300).delay('undefined' !== typeof timeout ? timeout : 1500).fadeOut(300);
      },
      hide: function () {
        $('#connectivity_dialog').hide();
      }
    };
    this.info = {
      flash: function (text, timeout) {
        var t = text;
        $('#info_dialog').queue(function () {
          $(this).text(t);
          $(this).dequeue();
        }).fadeIn(300).delay('undefined' !== typeof timeout ? timeout : 1500).fadeOut(300);
      }
    };
    this.error = function (text) {
      var error_dialog = $('#error_dialog').clone();
      var icon_html = "<span class='ui-state-error'><span class=\"ui-icon ui-icon-alert content_icon \"></span></span>";
      error_dialog.find('.dialog-text').html(icon_html + text);
      proto.Dialog.load(error_dialog, {
        autoOpen: true,
        height: 200,
        title: 'Error',
        stack: true,
        dialogClass: 'error-dialog popup-dialog',
        width: 320,
        buttons: {
          'OK': function () {
            $(this).dialog('close');
          }
        }
      });
    };
    this.warning = function (text) {
      var warning_dialog = $('#warning_dialog').clone();
      var icon_html = "<span class='ui-state-error'><span class=\"ui-icon ui-icon-notice content_icon \"></span></span>";
      warning_dialog.find('.dialog-text').html(icon_html + text);
      proto.Dialog.load(warning_dialog, {
        autoOpen: true,
        height: 200,
        title: 'Warning',
        stack: true,
        dialogClass: 'warning-dialog popup-dialog',
        width: 320,
        buttons: {
          'OK': function () {
            $(this).dialog('close');
          }
        }
      });
    };
  },

  showConfirmDialog: function (dialog_title, confirm_text, ok_function, cancel_function) {
    var confirm_dialog = $('#confirm_dialog').clone();
    confirm_dialog.find('#confirm_dialog_text').html(confirm_text);
    proto.Dialog.load(confirm_dialog, {
      autoOpen: true,
      dialogClass: 'confirm_dialog',
      title: dialog_title,
      width: 320,
      buttons: {
        'Yes': function () {
          $(this).dialog('close');
          if ($.isFunction(ok_function)) {
            ok_function();
          }
        },
        'Cancel': function () {
          $(this).dialog('close');
          if ($.isFunction(cancel_function)) {
            cancel_function();
          }
        }
      }
    });
  }
});