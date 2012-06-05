/*global Class
 */
var UIAccordion = UIComponent.extend({
  init: function (opts) {
    this._super(opts);
    
    this.tabs = [];
    // opts.tabs should be defined for an accordion
    for (var ti = 0;ti < opts.tabs.length;ti++) {
      var tab = this.manager.getFactory().createComponent(opts.tabs[ti]);
      if (null !== tab) {
        this.tabs.push(tab);
      }
    }
  },
  
  load: function (container) {
    var div = $('<div>', {
      id: this.id
    });
    for (var ti = 0;ti < this.tabs.length;ti++) {
      var temp = this.tabs[ti];
      temp.load(div);
      
      var content = $('<div>', {
        id: 'accordionContent_' + temp.id
      });
      if (temp.content) {
        //self.loadComponent(temp.content, content);
        temp.content.load(content);
      }
      div.append(content);
    }
    container.append(div);
    // TODO: determine options to pass into accordion constructor
    var opts = this.opts || {};
    this.dom_object = $('#' + this.id).accordion(opts);
  }
  
});