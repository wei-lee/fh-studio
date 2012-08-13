application.AccountAccordionManager = application.AccordionManager.extend({
    
  init: function (accordion_name) {
    this._super(accordion_name);
  },
    
  postSelectProfileDetails: function () {
    $fw.client.profile.doLoad();
    if (change_password_button === null) {
      change_password_button = $('#change_password_button').bind('click', function (e) {
        e.preventDefault();
        $fw.client.profile.doChangePassword();
      });
    }
  },

  postSelectKeysManage: function () {
    $fw.client.keys.show();
  },
  
  postSelectDestinationsApple: function () {
    $fw.client.resource.apple.setupDestination();
  },

  postSelectDestinationsAndroid: function () {
    $fw.client.resource.android.setupDestination();
  },

  postSelectDestinationsBlackberry: function () {
    $fw.client.resource.blackberry.setupDestination();
  }
});