var Apps = Apps || {};
Apps.Forms = Apps.Forms || {};

Apps.Forms.Controller = Apps.Controller.extend({
  views : {
    container: '#forms_app_container'
  },
  init: function() {
    this._super();
  },
  show: function(e) {
    debugger;
    this._super(this.views.container);
    var self = this,
    box_container = $($(this.views.container).find('.fh-box-inner'));
    $(this.views.container).show();

    self.view = new App.View.FormAppsCreateEdit({});
    box_container.empty().append(self.view.render().$el);
  }
});