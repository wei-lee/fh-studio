proto.ProgressDialog = {
  defaults: {
    value: 0,
    modal: true
  },
  
  load: function (el, overrides) {
    el = proto.Dialog.load(el, {
      width:350,
      dialogClass: 'ui-dialog-noclose ui-dialog-notitle ui-dialog-progress'
    });
    el.find('.progressbar').progressbar($.extend({}, proto.ProgressDialog.defaults, overrides));
    el.find('.progresslog').attr('readonly', 'readonly');
    return el;
  },
  
  /*
   * Reset the progress to 0 and clear the progress log
   */
  reset: function (el) {
    proto.ProgressDialog.resetBarAndLog(el);
    el.dialog('option', 'title', '');
  },
  
  /*
   * Set the title of the progress dialog
   */
  setTitle: function (el, title) {
    el.dialog('option', 'title', title);
  },
  
  /*
   * Set the current progress percent
   */
  setProgress: function (el, new_val) {
    el.find('.progressbar').progressbar('option', 'value', new_val);
  },
  
  setText: function (el, text) {
    el.find('.progresslog').val(text);
  },
  
  resetBarAndLog: function (el) {
    el.find('.progressbar').progressbar('option', 'value', 0);
    el.find('.progresslog').val('');
  },
  
  /*
   * Append the log message to the progress log
   */
  append: function (el, msg, task) {
    var log = el.find('.progresslog');
    if ('undefined' !== typeof task) {
      msg = '[' + task + '] ' + msg;
    }
    log.val(log.val() + msg + '\n');
    log.prop('scrollTop', log.prop('scrollHeight'));
  },
  
  /*
   * Show the entire dialog
   */
  show: function (el) {
    el.show().dialog('open');
  },
  
  /*
   * Hide the entire dialog
   */
  hide: function (el) {
    el.dialog('close');
  }
};