var Controller = Class.extend({

  progressModal: null,

  init: function () {
    // generic controller stuff
  },

  show: function () {
    // generic show
  },

  hide: function () {
    // generic hide
  },

  // Generic Swap select controller
  bindSwapSelect: function(container) {
    $(container).find('.swap-select').each(function(i, item){
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
  clearSwapSelects: function (container) {
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
      if (('undefined' === typeof to) || (to.indexOf(from_item) < 0)) {
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

  // show a simple yes|no modal, where success is called if yes is chosen
  // TODO: allow a fail callback to be specified in event of 'no' selected
  showBooleanModal: function (msg, success) {
    var modal = $('#generic_boolean_modal').clone();
    modal.find('.modal-body').html(msg).end().appendTo($("body")).modal({
      "keyboard": false,
      "backdrop": "static"
    }).find('.btn-primary').unbind().on('click', function () {
      // confirmed delete, go ahead
      modal.modal('hide');
      success();
    }).end().on('hidden', function() {
      // wait a couple seconds for modal backdrop to be hidden also before removing from dom
      setTimeout(function () {
        modal.remove();
      }, 2000);
    });
  },

  // resets all form elements (inputs etc..) in the given container
  resetForm: function (container, enable) {
    $('input[type=text],input[type=email],input[type=password]', container).val('').attr('disabled');
    $('input[type=checkbox]', container).removeAttr('checked').attr('disabled');
    $('select,button', container).attr('disabled', 'disabled');
    this.clearSwapSelects(container);
  },

  destroyProgressModal: function () {
    var self = this;

    self.progressModal.modal('hide');
    setTimeout(function(){
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
  }
});