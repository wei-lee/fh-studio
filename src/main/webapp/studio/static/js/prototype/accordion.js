proto.Accordion = {
  defaults : {
    collapsible: false,
    fillSpace: false,
    autoHeight: false,
    maxHeight: true,
    active: 0
  },
  
  load: function (el, overrides) {
    el.accordion($.extend({}, proto.Accordion.defaults, overrides));
    
    //Analytics Integration
    $fw_manager.client.analytics.doAccordion(el);
    
    return el;
  },

  resizeVisible: function() {
    var accord = $('.ui-accordion:visible');
    if (accord.length > 0) {
      accord.accordion('resize');
    }
  }
}