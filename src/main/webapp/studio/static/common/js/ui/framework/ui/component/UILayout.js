/*global $ this.manager.getFactory()
 */
var UILayout = UIComponent.extend({
  init: function (opts) {
    this._super(opts);
    this.center = this.getComponent('center', opts);
    this.north = opts.north ? this.manager.getFactory().createComponent(opts.north) : null;
    this.south = opts.south ? this.manager.getFactory().createComponent(opts.south) : null;
    this.east = opts.east ? this.manager.getFactory().createComponent(opts.east) : null;
    this.west = opts.west ? this.manager.getFactory().createComponent(opts.west) : null;
  },
  
  getComponent: function (pane, opts) {
    if ($.isArray(opts[pane])) {
      var components = opts[pane]; 
      var ret = [];
      for (var ci = 0;ci < components.length;ci++) {
        //var component = ui_component_factory.createComponent(opts.components[ci]);
        var component = this.manager.getFactory().createComponent(components[ci]);
        if (null !== component) {
          ret.push(component);
        }
      }
      return ret;
    }
    return this.manager.getFactory().createComponent(opts[pane]);
  },
  
  load: function (container) {
    // append the 5 layout panes to the container
    var north = this.createPane('north', container);
    var south = this.createPane('south', container);
    var center = this.createPane('center', container);
    var east = this.createPane('east', container);
    var west = this.createPane('west', container);
    
    this.north.load(north);
    this.south.load(south);
    // TOOD: tidy up
    if ($.isArray(this.center)) {
      for (var ci=0; ci<this.center.length; ci++) {
        this.center[ci].load(center);
      }
    }
    else {
      this.center.load(center); 
    }
    this.east.load(east);
    this.west.load(west);
    
    var defaults = {
      applyDefaultStyles: false,
      resizable: false,
      slidable: false,
      spacing_open: 0,
      spacing_closed: 0
    };
    this.dom_object = container.layout($.extend(defaults,this.params));
    //this.dom_object.resizeAll();
  },
  
  createPane: function (pane, container) {
    var new_pane = $('<div>', {
      id: this.id + '_' + pane,
      'class': 'ui-layout-' + pane
    });
    container.append(new_pane);
    return new_pane;
  }
  
});