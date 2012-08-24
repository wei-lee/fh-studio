var Account = Account || {};

Account.Profile = Account.Profile || {};

Account.Profile.Controller = Controller.extend({

  models: {
    user: new model.User()
  },

  views: {
    profile_details_container: '#profile_details_container'
  },

  container: null,

  init: function () {
    this.initFn = _.once(this.initBindings);
  },

  initBindings: function () {
    var self = this;

    $fw.client.lang.insertLangForContainer($(this.views.profile_details_container));

    $('#change_password_button').bind('click', function (e) {
      e.preventDefault();
      self.doChangePassword();
    });
  },

  show: function(){
    this._super();

    this.initFn();

    this.container = this.views.profile_details_container;
    $(this.container).show();

    this.models.user.read(function (res) {
      var accountType = $fw.client.lang.getLangString('account_type_' + $fw.getClientProp('accountType'));
      //$('.profile_user_display').text(res.displayName + ' (' + accountType + ')');
      $('.profile_view_name').text(res.userName);
      $('.profile_view_email').text(res.email);
      $('.profile_view_account').text(accountType);
    });
  },
    
  doChangePassword: function(){
    var self = this;
    console.log("doChangePassword");

    var form = $('#profile_changepassword');
    var validated_form = self.validatePasswordForm(form);
    if (form.valid()) {
      console.log('valid');
      var current_password = validated_form.findByName('current_password').val();
      var new_password = validated_form.findByName('new_password').val();
      self.models.user.changePassword(current_password, new_password, function (result) {
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
    $fw.server.post(Constants.LOGOUT_URL, {'feedhenry':'true'}, function () {
      document.location = document.location;
    });
  }
});