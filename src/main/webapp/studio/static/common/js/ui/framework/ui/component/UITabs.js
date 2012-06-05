/*global $ UIComponent
 */
var UITabs = UIComponent.extend({
  init: function (opts) {
    this._super(opts);
    
    this.tabs = [];
    for (var ci=0;ci < opts.tabs.length;ci++) {
      this.tabs.push(this.manager.getFactory().createComponent(opts.tabs[ci]));
    }
  },
  
  // TODO: refactor load out to a pre-load and post-load
  load: function (container) {
    var div = $('<div>', {
      id: this.id
    });
    var ul = $('<ul>');
    
    var tabs = this.tabs;
    for (var ci = 0;ci < tabs.length;ci++) {
      ul.append($('<li>').append($('<a>', {
        href: '#tabs-' + (ci + 1),
        // TODO: button text should come from language definition
        text: tabs[ci].tab_title
      })));
      
      var tab_div = $('<div>', {
        id: 'tabs-' + (ci + 1)
      });
      div.append(tab_div);
      // TODO: lazy loading of tab contents for non default tab
      tabs[ci].load(tab_div);
    }
    
    container.append(div.prepend(ul));
    
    var fn = function (event, ui) {
      var tab = ui.data('component');
      this.manager.getStateManager().setState(tab.id, 'selected', ui.index);
      tab.tabs[ui.index].load(ui.panel);
    }
    // TODO: bind callback to select event for lazy loading of tab contents
    //this.params.select = fn;
    
    this.params.selected = this.manager.getStateManager().getState(this.id, 'selected');
    this.dom_object = div.tabs(this.params);
    // TODO: implement this in a super way
    this.dom_object.data('component', this);
  }
  
});