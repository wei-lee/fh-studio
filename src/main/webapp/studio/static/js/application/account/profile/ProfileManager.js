application.ProfileManager = Class.extend({
  init: function () {

  },
  
  doLoad: function(){
    //$fw_manager.app.readUserDetails($fw_manager.client.profile.displayProfile);
    $fw_manager.client.model.User.read($fw_manager.client.profile.displayProfile);
  },

  displayProfile: function(result){
    var accountType = $fw.client.lang.getLangString('account_type_' + $fw.getClientProp('accountType'));
    //$('.profile_user_display').text(result.displayName + ' (' + accountType + ')');
    $('.profile_view_name').text(result.userName);
    $('.profile_view_email').text(result.email);
    $('.profile_view_account').text(accountType);
  },
    
  doChangePassword: function(){
    Log.append("doChangePassword");
    // TODO: some of this could be made more generic and reused
    var form = $('#profile_changepassword');
    var validated_form = $fw_manager.client.profile.validatePasswordForm(form);
    if (form.valid()) {
      Log.append('valid');
      var current_password = validated_form.findByName('current_password').val();
      var new_password = validated_form.findByName('new_password').val();
      $fw_manager.client.model.User.changePassword(current_password, new_password, function (result) {
        $fw_manager.client.dialog.info.flash($fw_manager.client.lang.getLangString('password_changed'));
      }, function (error) {
        if (error === 'bad-password') {
          $fw_manager.client.dialog.error($fw_manager.client.lang.getLangString('bad_password'));
        }
        else {
          $fw_manager.client.dialog.error(error);
        }
      });
    }
  },
  
  // TODO: move this to a more appropriate location
  validatePasswordForm: function (form) {
    return form.validate({
      rules: {
        'current_password': 'required',
        'new_password': 'validpass',
        'confirm_password': {
          validpass: true,
          equalTo: '#new_password'
        }
      }
    });
  },
  
  doLogout: function() {
    $fw_manager.server.post(Constants.LOGOUT_URL, {'feedhenry':'true'}, function () 
      {
        document.location = document.location;
      }
    );
  }  
});
