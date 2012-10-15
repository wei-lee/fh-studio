application.DialogManager = Class.extend({

  init: function() {
    this.progress = proto.ProgressDialog.load($('#progress_dialog'), {});
    this.connectivity = {
      show: function(text) {
        $fw.client.dialog.info.flash(text, 5000);
      }
    };
    this.info = {
      flash: function(text, timeout) {
        var t = text;
        $('#info_dialog').queue(function() {
          $(this).text(t);
          $(this).dequeue();
        }).fadeIn(300).delay('undefined' !== typeof timeout ? timeout : 1500).fadeOut(300);
      }
    };
    this.error = function(text) {
      var modal = $('#generic_error_modal').clone();
      modal.find('.modal-body').html(text).end().appendTo($("body")).modal({
        "keyboard": false,
        "backdrop": "static"
      }).find('.btn-primary').unbind().on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // confirmed delete, go ahead
        modal.modal('hide');
      }).end().on('hidden', function() {
        // wait a couple seconds for modal backdrop to be hidden also before removing from dom
        setTimeout(function() {
          modal.remove();
        }, 2000);
      });
    };
    this.warning = function(text) {
      var modal = $('#generic_warning_modal').clone();
      modal.find('.modal-body').html(text).end().appendTo($("body")).modal({
        "keyboard": false,
        "backdrop": "static"
      }).find('.btn-primary').unbind().on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // confirmed delete, go ahead
        modal.modal('hide');
      }).end().on('hidden', function() {
        // wait a couple seconds for modal backdrop to be hidden also before removing from dom
        setTimeout(function() {
          modal.remove();
        }, 2000);
      });
    };
  },

  showConfirmDialog: function(dialog_title, confirm_text, ok_function, cancel_function) {
    var modal = $('#generic_confirmation_modal').clone();
    modal.find('.modal-body').html(confirm_text).end().appendTo($("body")).modal({
      "keyboard": false,
      "backdrop": "static"
    }).find('.cancel-dialog').unbind().on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      // confirmed delete, go ahead
      modal.modal('hide');
      if ($.isFunction(cancel_function)) {
        cancel_function();
      }
    }).end().find('.ok-dialog').unbind().on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      // confirmed delete, go ahead
      modal.modal('hide');
      if ($.isFunction(ok_function)) {
        ok_function();
      }
    }).end().on('hidden', function() {
      // wait a couple seconds for modal backdrop to be hidden also before removing from dom
      setTimeout(function() {
        modal.remove();
      }, 2000);
    });
  }
});