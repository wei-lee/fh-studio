application.ArmUsersLayout = application.TabManager.extend({
  name: 'armusers',
  
  init: function (opts) {
    this._super(opts);
  },
  
  getBaseCrumbs: function(){
    return [{text: "Admin", callback: function () {
        $fw_manager.client.tab.arm.showLayout('arm');
      }}];
  },
  
  constructBreadcrumbsArray: function () {
    var crumbs = this.getBaseCrumbs();
    var accordion = this.tab_content.find('.ui-layout-west .ui-accordion');
    var b1 = accordion.find('h3.ui-state-active:visible');
    var b2 = accordion.find('.ui-accordion-content-active .ui-state-active:visible');
    crumbs.push({text: b1.text(), callback: function () {
        $fw_manager.client.tab.arm.showLayout('arm');
        accordion.find('.ui-accordion-content-active .ui-menu li:first-child a').trigger('click');
      }});
    crumbs.push({text: $fw_manager.state.get('arm_users_name', 'current_users_name')});
    crumbs.push({text: b2.text()});
    return crumbs;
  }
});