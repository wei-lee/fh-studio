/*
 * Slightly modified jquery ui tabs for use with the center
 * pane of a ui-layout
 * http://layout.jquery-dev.net/tips.cfm#Widget_Tabs
 */
var UILayoutTabs = UITabs.extend({
  
  /*
   * Call the super constructor and initialise any fields
   */
  init: function (opts) {
    this._super(opts);
  },
  
  // TODO: refactor load out to a pre-load and post-load
  // TODO: this code is almost identical to UITabs.load(). 
  //       Inheritance doesn't call the most derived function 
  //       so a solution for less code duplication is needed
  load: function (container) {
    var ul = $('<ul>');
    var wrapper = $('<div>', {
      'class': 'ui-layout-content'
    });
    var tabs = this.tabs;
    for (var ti = 0;ti < tabs.length;ti++) {
      ul.append($('<li>').append($('<a>', {
        href: '#tabs-' + (ti + 1),
        // TODO: button text should come from language definition
        text: tabs[ti].tab_title
      })));
      
      var tab_div = $('<div>', {
        id: 'tabs-' + (ti + 1)
      });
      wrapper.append(tab_div);
      // TODO: lazy loading of tab contents for non default tab
      //tabs[ti].load(tab_div);
    }
    
    //div.append(ul).append(wrapper);
    //container.append(div);
    container.append(ul).append(wrapper);
    
    /*var fn = function (event, ui) {
      var tab = ui.data('component');
      this.manager.getStateManager().setState(tab.id, 'selected', ui.index);
      tab.tabs[ui.index].load(ui.panel);
    };*/
    // TODO: bind callback to select event for lazy loading of tab contents
    //this.params.select = fn;
    
    // TODO: test and implement state
    //this.params.selected = this.manager.getStateManager().getState(this.id, 'selected');
    
    this.params.selected = 0;
    
    //this.dom_object = div.tabs(this.params);
    
    // TODO: this dom_object is also it's parent. Necessary for layout tabs to work
    //       maybe need to revisit to ensure it doesn't conflict anywhere
    this.dom_object = container.tabs(this.params);
    
    // TODO: extra loop not needed here, move up
    // do loading of sub components here
    for (var ti = 0;ti < tabs.length;ti++) {
      tabs[ti].load(this.dom_object.find('#tabs-' + (1 + ti)));
    }
    
    // TODO: implement this in a super way
    this.dom_object.data('component', this);
  }
});