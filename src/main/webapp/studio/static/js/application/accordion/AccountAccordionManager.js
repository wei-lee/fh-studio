application.AccountAccordionManager = application.AccordionManager.extend({
    
  init: function (accordion_name) {
    this._super(accordion_name);
  },
    
  postSelectProfileDetails: function () {
    $fw_manager.client.profile.doLoad();
    if (change_password_button === null) {
      change_password_button = $('#change_password_button').bind('click', function (e) {
        e.preventDefault();
        $fw_manager.client.profile.doChangePassword();
      });
    }
  },

  postSelectKeysManage: function () {
    $fw_manager.client.keys.show();
  },
  
  postSelectDestinationsApple: function () {
    $fw_manager.client.resource.apple.setupDestination();
  },

  postSelectDestinationsAndroid: function () {
    $fw_manager.client.resource.android.setupDestination();
  },

  postSelectDestinationsBlackberry: function () {
    $fw_manager.client.resource.blackberry.setupDestination();
  }
});