application.ArmdevicesAccordionManager = application.AccordionManager.extend({
    
  init: function (accordion_name) {
    this._super(accordion_name);
  },
  
  postSelectArmdevicesEdit: function(){
    $fw_manager.client.arm.devices.initEdit();
  },
  
  postSelectArmdevicesAssignusers: function(){
    $fw_manager.client.arm.devices.initUsers();
  }
});