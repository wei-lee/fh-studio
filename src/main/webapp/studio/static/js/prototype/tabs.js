proto.Tabs = {
  defaults: {
    selected: 0
  },
  
  load: function (el, overrides) {
    el.tabs($.extend({}, proto.Tabs.defaults, overrides));
    
    //Analytics Integration
    $fw_manager.client.analytics.doTabs(el);
    
    return el;
  }
};