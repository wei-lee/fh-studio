var Controller = Class.extend({

  progressModal: null,
  views: {},
  models: {},
  alert_timeout: 3000,

  init: function() {
    // generic controller stuff
  },

  show: function() {
    // generic show
  },

  hide: function() {
    $.each(this.views, function(k, v) {
      $(v).hide();
    });
  },

  reset: function() {
    // generic reset - resets all views
  },

  hideAlerts: function() {
    if (typeof this.views !== 'undefined') {
      $.each(this.views, function(k, v) {
        $('.alerts .alert', v).remove();
      });
    }
  },

  // type: error|success|info
  showAlert: function(type, message) {
    var self = this;
    var alerts_area = $(this.container).find('.alerts');
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

  // Generic Swap select controller
  bindSwapSelect: function(container) {
    $(container).find('.swap-select').each(function(i, item) {
      var add_button = $('.add', item);
      var remove_button = $('.remove', item);
      var swap_from = $('.swap-from', item);
      var swap_to = $('.swap-to', item);

      add_button.unbind().click(function() {
        $('option:selected', swap_from).each(function() {
          swap_to.append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option>");
          $(this).remove();
        });
        return false;
      });
      remove_button.unbind().click(function() {
        $('option:selected', swap_to).each(function() {
          swap_from.append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option>");
          $(this).remove();
        });
        return false;
      });
    });
  },

  // clears/resets all swap selects found in container
  clearSwapSelects: function(container) {
    $(container).find('.swap-select select').empty().html('<option>Loading...</option>');
  },

  // updates the swap select, given as the container, with the form and to values.
  // to values are optional
  // from/to values can be:
  // - array of values to use as text and 'value' e.g. [['TEST'], ...] ==> <option value="TEST">TEST</option>...
  // - or array of arrays, where each sub-array has 2 values, the text and the 'value' e.g. [['TEST','testid'], ...] ==> <option value="testid">TEST</option>...
  updateSwapSelect: function(container, from, to) {
    var from_list = $('.swap-from', container).empty();
    $.each(from, function(i, from_item) {
      if (('undefined' === typeof to) || ((to.indexOf(from_item) < 0) && ('string' !== typeof from_item ? (((to.length > 0 && to[0].length > 0) ? to[0][1] : true) !== from_item[1]) : true))) {
        var option = $('<option>');
        if ('string' === typeof from_item) {
          option.text(from_item).val(from_item);
        } else {
          // have name, value as array
          option.text(from_item[0]).val(from_item[1]);
        }
        from_list.append(option);
      }
    });
    from_list.removeAttr("disabled");

    var to_list = $('.swap-to', container).empty();
    if ('undefined' !== typeof to) {
      $.each(to, function(i, to_item) {
        var option = $('<option>');
        if ('string' === typeof to_item) {
          option.text(to_item).val(to_item);
        } else {
          // have name, value as array
          option.text(to_item[0]).val(to_item[1]);
        }
        to_list.append(option);
      });
    }
    to_list.removeAttr("disabled");
  },

  getSelectedItems: function(container) {
    var store_item_options = $('.swap-to option', container);
    var items = [];
    store_item_options.each(function(i, item) {
      items.push($(item).val());
    });
    return items;
  },

  // show a simple yes|no modal, where success is called if yes is chosen
  // TODO: allow a fail callback to be specified in event of 'no' selected
  showBooleanModal: function(msg, success) {
    var modal = $('#generic_boolean_modal').clone();
    modal.find('.modal-body').html(msg).end().appendTo($("body")).modal({
      "keyboard": false,
      "backdrop": "static"
    }).find('.btn-primary').unbind().on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      // confirmed delete, go ahead
      modal.modal('hide');
      success();
    }).end().on('hidden', function() {
      // wait a couple seconds for modal backdrop to be hidden also before removing from dom
      setTimeout(function() {
        modal.remove();
      }, 2000);
    });
  },

  // resets all form elements (inputs etc..) in the given container
  resetForm: function(container) {
    $('input[type=text],input[type=email],input[type=password]', container).val('').attr('disabled');
    $('input[type=checkbox]', container).removeAttr('checked').attr('disabled');
    $('select,button', container).attr('disabled', 'disabled');
    this.clearSwapSelects(container);
  },

  destroyProgressModal: function() {
    var self = this;

    self.progressModal.modal('hide');
    setTimeout(function() {
      self.progressModal.remove();
      self.progressModal = null;
    }, 2000);
  },

  clearProgressModal: function() {
    var log_area = this.progressModal.find('textarea');
    current = log_area.val('');
    this.updateProgressBar(0);
  },

  appendProgressLog: function(message) {
    var log_area = this.progressModal.find('textarea');
    var current = log_area.val();
    log_area.val(current + message + "\n");
    log_area.scrollTop(99999);
    log_area.scrollTop(log_area.scrollTop() * 12);
  },

  updateProgressBar: function(value) {
    var progress_bar = this.progressModal.find('.progress .bar');
    progress_bar.css('width', value + '%');
    this.current_progress = value;
  },

  showProgressModal: function(title, message, cb) {
    this.progressModal = $('#generic_progress_modal').clone();
    this.progressModal.find('h3').text(title).end().find('h4').text(message).end().appendTo($("body")).one('shown', cb).modal();
  },

  markCompleteSuccess: function() {
    var progress_bar = this.progressModal.find('.progress .bar');
    progress_bar.css('width', 100 + '%');
    progress_bar.addClass('bar-success');
    progress_bar.parent().removeClass('progress-striped');
  },

  markCompleteFailure: function() {
    var progress_bar = this.progressModal.find('.progress .bar');
    progress_bar.css('width', 100 + '%');
    progress_bar.addClass('bar-error');
    progress_bar.parent().removeClass('progress-striped');
  },

  getColumnIndexForField: function (aoColumns,field,value){
    var found = $.grep(aoColumns,function(item, i){return item[field] === value;});
    var col = $(aoColumns).index(found[0]);
    return col;

  }
});