application.UseradminAccordionManager = application.AccordionManager.extend({
    
  init: function (accordion_name) {
    this._super(accordion_name);
    this.controller = new UserAdmin.Controller();
  },

  postSelectUsersList: function() {
    $fw_manager.client.useradmin.showUsersList();
  }
});