/*
 * Concerned with anything to do with a top level tab,
 * such as initialising its contents, showing it, or updating the breadcrumb
 */
application.TabManager = Class.extend({
  support: null,
  name: null,
  tab: null,
  tab_content: null,
  inited: false,
  layout: null,
  accordion: null,
  
  init: function (opts) {
    this.support = new application.TabSupport();
  },
  
  constructBreadcrumbsArray: function () {
  	var crumbs = this.getBaseCrumbs();
    var accordion = this.tab_content.find('.ui-layout-west .ui-accordion');
    var b1 = accordion.find('h3.ui-state-active:visible');
    var b2 = accordion.find('.ui-accordion-content-active .ui-state-active:visible');
    crumbs.push({text: b1.text(), callback: function () {
        accordion.find('.ui-accordion-content-active .ui-menu li:first-child a').trigger('click');
      }});
    crumbs.push({text: b2.text()})
    return crumbs;
  },
  
  doUpdateBreadcrumb: function () {
    var crumbs = this.constructBreadcrumbsArray();
    var crumbs_html = this.createBreadcrumbsHtml(crumbs);
    this.tab_content.find('.container-title').empty().html(crumbs_html);
    Log.append('closing all dialogs');
    // Close all dialogs, except for warning dialogs, as they may have been opened 
    // just before this tab is shown
    $('.dialog').not('#warning_dialog').dialog('close');
  },
  
  show: function (event, ui) {
    this.doPreShow();
    
    if (!this.inited) {
      this.setTab(event, ui);
      this.doPreInit();
      // do any stuff that requires the tab content to be initialsed here
      
      // for lang, include every element inside the tab content, except the inner layout center pane
      var elements = this.tab_content.find($fw_manager.client.lang.SELECTOR_STRING).not('.inner-layout .ui-layout-center *');
      $fw_manager.client.lang.insertLangForElements(elements, this.name + '_tab');
      
      this.bindBreadcrumbEvents();
      
      this.doPostInit();
      this.inited = true;
    }
    else {
      this.doReset();
    }
    
    this.doPostShow();
    Log.append('tab id: ' + this.name + '_tab');
  },
  
  doPreInit: function () {
    this.layout = proto.Layout.load($('#' + this.name + '_layout'), {
      center__onresize: function (pane, $Pane, pane_state) {
        proto.Accordion.resizeVisible();
        proto.Grid.resizeVisible();
      },
      east__initClosed: true
    });
    
    var accordion_name = this.name + '_accordion',
        manager_name = js_util.capitalise(this.name) + 'AccordionManager';
    
    if ('undefined' !== typeof application[manager_name]) {
      this.accordion = new application[manager_name](accordion_name);
    } else {
      this.accordion = new application.AccordionManager(accordion_name); 
    }
    this.accordion.show();
  },
  
  setTab: function (event, ui) {
    this.tab = $(ui.tab);
    this.tab_content = $(ui.panel);
  },
  
  bindBreadcrumbEvents: function () {
    Log.append('binding breadcrumbs');
    var that = this;
    this.tab_content.find('.fh_breadcrumb').live('click', function () {
      that.doUpdateBreadcrumb();
    });
  },
  
  doPostInit: function () {
    //this.accordion.find('.ui-accordion-content-active').find('li.ui-state-active').click();
  },
  
  doPreShow: function () {
    Log.append('doPreShow not implemented for ' + this.name + '_tab');
  },
  
  doReset: function () {
    this.accordion.reset();
  },
  
  doPostShow: function () {
    main_layout.resizeAll();
    this.layout.resizeAll();
  },
  
  
  
  /* Suppport Functions */
  
  createBreadcrumbsHtml: function (crumbs) {
    return this.support.createBreadcrumbsHtml(crumbs);
  },
  
  getBaseCrumbs: function(){
  	return [];
  }
});