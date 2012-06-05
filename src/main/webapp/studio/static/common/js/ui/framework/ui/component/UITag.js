/*global $ ui_component_factory UIComponent UITag EventChain
 */
var UITag = UIComponent.extend({
  type: 'tag',
  
  init: function (opts) {
    // must call _super here, otherwise, some very weird behaviour is observerd
    // e.g. some other component is returned from the constructor!
    this._super(opts);
    if ('undefined' === typeof this.tag) {
      this.tag = '<div>';
    }
  },
  
  load: function (container) {
    var objDef = {};
    objDef.id = this.id;
    if (this.classes) {
      objDef['class'] = this.classes;
    }
    if (this.text) {
      objDef.text = this.text;
    }
    if ('<a>' === this.tag && 'string' === typeof this.href) {
      objDef.href = this.href;
    }
    this.dom_object = $(this.tag, objDef);
    
    this.setUpEvents();
    
    container.append(this.dom_object);
    
    var comps = this.components;
    for (var ci = 0;ci < comps.length; ci++) {
      comps[ci].load(this.dom_object);          
    }
    
    if ('string' === typeof this.tooltip) {
      //self.setUpTooltip(this.tooltip, newComp);
      this.setUpTooltip(this.tooltip);
    }
  },
  
  /*
   * Apply the tootip text to the given component
   * Uses the jQuery qtip plugin
   */
  setUpTooltip: function (tooltip) {
    this.dom_object.qtip({
      content: {
        text: this.manager.getLang(tooltip),
        prerender: this.manager.doTooltipPrerender() 
      },
      show: 'mouseover',
      hide: 'mouseout'
    });
  },

  // TODO: move this out to event manager    
  setUpEvents: function () {
    for (var event in this.events) {
      var callback = this.events[event];
      if ('string' === typeof callback) {
        callback = window.application[callback];
      }
      this.manager.getEventManager().registerEvent(this.dom_object, event, callback, new EventChain());
    }
  }
});