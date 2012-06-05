application.ArmgroupsAccordionManager = application.AccordionManager.extend({
    
  init: function (accordion_name) {
    this._super(accordion_name);
  },
  
  postSelectArmgroupsEdit: function(){
    $fw_manager.client.arm.groups.initEdit();
  },
  
  postSelectArmgroupsAssignusers: function(){
  	$fw_manager.client.arm.groups.initUsers();
  },
  
  postSelectArmgroupsAssignapps: function(){
  	$fw_manager.client.arm.groups.initApps();
  }
});