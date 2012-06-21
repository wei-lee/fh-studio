proto.Dialog = {
  defaults: {
    modal: true,
    closeOnEscape: false,
    autoOpen: false,
    resizable: false,
    width: 600,
    draggable:false,
    // default to no dialog title as this dialog is merely a wrapper element
    dialogClass: 'ui-dialog-notitle custom-dialog'
  },
  
  load: function (el, overrides) {
    el = el.dialog($.extend({}, proto.Dialog.defaults, overrides));
    // De-JQ UI-ify these buttons
    el.parent().find('.jw-buttons button').removeClass('ui-state-default ui-corner-all').addClass('btn btn-primary');
    return el;
  }
};