/*global ui_component_factory Class
 */
var UIComponent = Class.extend({
  manager: null,
  id: null,
  
  init: function (opts) {
    $.extend(this, opts);
    //this.id = opts.id;
    // TODO: Is there a better way of forcing an option to be required?
    // Call .length to ensure id is defined. Throws a regular undefined error & 
    //   stacktrace if it isn't, alerting the model definer to the problem
    this.id.length;
    //this.manager = opts.manager;
    if ('undefined' === typeof this.params) {
      this.params = {};
    }
    if ('undefined' === typeof this.events) {
      this.events = {};
    }
    
    this.components = [];
    if ('undefined' !== typeof opts.components) {
      for (var ci = 0;ci < opts.components.length;ci++) {
        //var component = ui_component_factory.createComponent(opts.components[ci]);
        var component = this.manager.getFactory().createComponent(opts.components[ci]);
        if (null !== component) {
          this.components.push(component);
        }
      }
    } 
  },
  
  load: function () {
    alert('load function must be implemented for UIComponent subclass:' + JSON.stringify(this));
  }
});