var UserAdmin = UserAdmin || {};

UserAdmin.Controller = Class.extend({
  models: null,
  views: {
    users: "#useradmin_user_list"
  },
  config: null,

  init: function(params) {
    var self = this;
    var params = params || {};
    this.config = params.config || null;
  },

  showUsersList: function() {
    $(this.views.users).show();    
  }
});