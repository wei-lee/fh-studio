/*
 * 
 */
UIComponentFactory = Class.extend ( {
  manager: null,
  
  init: function (p_manager) {
    this.manager = p_manager;
    //this.getManager() = $fw_manager.ui;
  },
  
  /*
   * return the type in the object defintion, 
   * or the default type if it isn't defined
   */
  getType: function (def) {
    if ('string' === typeof def.type) {
      return def.type;
    }
    return 'tag';
  },
  
  /*
   * Return the string from the language definiton
   */
  getText: function (lang_str) {
    return lang[lang_str] || lang_str;
  },
  
  /*
   * Factory function for creating component objects from component definitions
   */
  createComponent: function (def) {
    // call the definition function
    var parsed = def();
    
    var mode = this.manager.getMode();
    // ensure that the component mode and the ui_manager mode match if they are both defined 
    if (mode !== null && 'undefined' !== typeof parsed.mode && parsed.mode !== mode) {
      return null;
    }
                 
    // set the type
    parsed.type = this.getType(parsed);
    
    // set the text
    if ('undefined' !== typeof parsed.text) {
      parsed.text = this.manager.getLang(parsed.text);
    }
    
    // include a reference to the ui manager
    parsed.manager = this.manager;
    
    var func = 'UI' + js_util.capitalise(parsed.type);
    var comp = new window[func](parsed);
    
    
    // bind any resize functions
    if ('function' === typeof comp.onResize) {
      console.log('binding resize');
      $(window).resize(function(e) {
        comp.onResize();
      });
    }
    
    return comp;
  }
});