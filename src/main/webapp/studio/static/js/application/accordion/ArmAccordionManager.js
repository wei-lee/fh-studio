application.ArmAccordionManager = application.AccordionManager.extend({
    
  init: function (accordion_name) {
    this._super(accordion_name);
  },
    
  postSelectAppsList: function () {
    $fw_manager.client.arm.apps.initGrid();
  },
  
  postSelectUsersList: function () {
    $fw_manager.client.useradmin.showUsersList();
  },
  
  postSelectUsersAdd: function(){
    $fw_manager.client.arm.users.initAdd();
  },

  postSelectGroupsList: function () {
    $fw_manager.client.useradmin.showGroupsList();
  },
  
  postSelectGroupsAdd: function(){
    $fw_manager.client.arm.groups.initAdd();
  },

  postSelectDevicesList: function () {
    $fw_manager.client.arm.devices.initGrid();
  },
  
  postSelectDevicesAdd: function(){
    $fw_manager.client.arm.devices.initAdd();
  },
  
  postSelectDevicesApprove: function(){
    $fw_manager.client.arm.devices.initApproveGrid();
  },
  
  postSelectAuthPoliciesManage: function(){
    $fw_manager.client.arm.authPolicies.showPolicyList();
  }
});