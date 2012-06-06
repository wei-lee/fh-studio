var UserAdmin = UserAdmin || {};

UserAdmin.Controller = Class.extend({
  models: null,
  views: [],
  config: null,

  init: function(params) {
    var self = this;
    var params = params || {};
    this.config = params.config || null;
  }
});