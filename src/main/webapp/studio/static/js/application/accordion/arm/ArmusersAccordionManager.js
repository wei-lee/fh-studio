application.ArmusersAccordionManager = application.AccordionManager.extend({
    
  init: function (accordion_name) {
    this._super(accordion_name);
  },
    
  postSelectArmusersEdit: function(){
  	$fw_manager.client.arm.users.initEdit();
  },
  
  postSelectArmusersAssigngroups: function(){
  	$fw_manager.client.arm.users.initGroups();
  },
  
  postSelectArmusersAssignapps: function(){
  	$fw_manager.client.arm.users.initApps();
  },
  
  postSelectArmusersAssigndevices: function(){
  	$fw_manager.client.arm.users.initDevices();
  },
  
  postSelectArmusersResetpass: function(){
  	$fw_manager.client.arm.users.resetUserPass();
  }
});