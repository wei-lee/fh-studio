application.ProfileManager = Class.extend({
  init: function () {

  },
  
  doLoad: function(){
    //$fw.app.readUserDetails($fw.client.profile.displayProfile);
    $fw.client.model.User.read(function (res) {
      var accountType = $fw.client.lang.getLangString('account_type_' + $fw.getClientProp('accountType'));
      //$('.profile_user_display').text(res.displayName + ' (' + accountType + ')');
      $('.profile_view_name').text(res.userName);
      $('.profile_view_email').text(res.email);
      $('.profile_view_account').text(accountType);
    });
  },
    
  doChangePassword: function(){
    console.log("doChangePassword");
    // TODO: some of this could be made more generic and reused
    var form = $('#profile_changepassword');
    var validated_form = $fw.client.profile.validatePasswordForm(form);
    if (form.valid()) {
      console.log('valid');
      var current_password = validated_form.findByName('current_password').val();
      var new_password = validated_form.findByName('new_password').val();
      $fw.client.model.User.changePassword(current_password, new_password, function (result) {
        $fw.client.dialog.info.flash($fw.client.lang.getLangString('password_changed'));
      }, function (error) {
        if (error === 'bad-password') {
          $fw.client.dialog.error($fw.client.lang.getLangString('bad_password'));
        }
        else {
          $fw.client.dialog.error(error);
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
    $fw.server.post(Constants.LOGOUT_URL, {'feedhenry':'true'}, function () 
      {
        document.location = document.location;
      }
    );
  }  
});
