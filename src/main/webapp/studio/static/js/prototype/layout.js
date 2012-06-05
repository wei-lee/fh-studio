proto.Layout = {
  defaults: {
      applyDefaultStyles: false,
      resizable: false,
      slidable: false,
      spacing_open: 0,
      spacing_closed: 0,
      enableCursorHotkey: false
  },
  
  load: function (el, overrides) {
    return el.layout($.extend({}, proto.Layout.defaults, overrides));
  }
};